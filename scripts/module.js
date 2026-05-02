import { MODULE_ID, registerSettings } from "./settings.js";
import { BonusFeatsConfig } from "./BonusFeatsConfig.js";

Hooks.on('init', function() {
	registerSettings()
});

Hooks.once("ready", () => {
    variantFeats();
    BonusFeatsConfig.removeOldFeatSections();
    updateCustomFeats();
});

window['pf2e-sf2e-extra-feat-slots'] = {
  generateSkillParagonFeat: generateSkillParagonFeat
}

async function generateSkillParagonFeat(skill) {
  let packFinder = [];

  if(game.system.id === "pf2e")
    packFinder.push("pf2e.feats-srd");
  if(game.modules.get("sf2e-anachronism")?.active)
    packFinder.push("sf2e-anachronism.feats");
  if(game.system.id === "sf2e")
    packFinder.push("sf2e.feats");
  if(game.modules.get("pf2e-anachronism")?.active)
    packFinder.push("pf2e-anachronism.feats");
  if(game.modules.get("pf2e-feats-plus")?.active)
    packFinder.push("pf2e-feats-plus.player-options");

  const packs = packFinder;
  
  const baseItemData = `{
    "name": "`+skill.charAt(0).toUpperCase() + skill.slice(1)+` Paragon",
    "type": "feat",
    "system": {
      "rules": [{
        "key": "ActiveEffectLike",
        "mode": "upgrade",
        "path": "system.skills.`+skill+`.rank",
        "value": "ternary(gte(@actor.level, 15), 4, ternary(gte(@actor.level, 7), 3, ternary(gte(@actor.level, 3), 2, 1)))"
      }]
    }
  }`;

  let data = JSON.parse(baseItemData);
  for(const pack of packs) {
    const idx = await game.packs.get(pack).getIndex({fields: ["system.traits.value", "system.traits.rarity", "system.prerequisites.value", "system.level.value"]});
    const traits = ["general", "skill"]
    const skillGeneralFeats = idx.filter(e => e.system.traits.value.every(s => traits.includes(s)) && e.system.traits.rarity === "common");
    console.log(skillGeneralFeats)
    for(const featData of skillGeneralFeats) {
      const prereqs = featData.system.prerequisites.value;
      const prerequisitesArr = prereqs.map((prerequisite) => prerequisite?.value ? prerequisite.value.toLowerCase() : "");
      const skills = new Set();
      for (const prereq of prerequisitesArr) {
        for (const [key, value] of Object.entries(CONFIG.PF2E.skills)) {
          // Check the string for the english translation key or a translated skill name
          const translated = game.i18n.localize(value.label).toLocaleLowerCase(game.i18n.lang);
          if (prereq.includes(key) || prereq.includes(translated)) {
            if(key === skill) {
              data.system.rules.push(
                {
                  "key": "GrantItem",
                  "uuid": featData.uuid,
                  "allowDuplicate": false,
                  "reevaluateOnUpdate": true,
                  "predicate": [
                  {
                    "gte": [
                    "self:level",
                    featData.system.level.value
                  ]
                  }]
                }
              )
            }
          }
        }
      }
    }
  }

  Item.create(data);
}

async function variantFeats() {
  const ancestryParagon = game.settings.get(MODULE_ID, "ancestryParagon");
  const skillParagon = game.settings.get(MODULE_ID, "skillParagon");
  const magaambyaBenefits = game.settings.get(MODULE_ID, "magaambyaBenefits");
  const custom = game.settings.get(MODULE_ID, "custom");

  // Add campaign feat sections if enabled
  if (ancestryParagon || skillParagon || magaambyaBenefits) {  
    
    const campaignFeatSections = game.settings.get(game.system.id, "campaignFeatSections");

    if (ancestryParagon) {
      if (!campaignFeatSections.find((section) => section.id === "ancestryParagon")) {
        campaignFeatSections.push({
          id: "ancestryParagon",
          label: "pf2e-sf2e-extra-feat-slots.SETTINGS.ancestryParagon.label",
          supported: ["ancestry"],
          slots: [1, 3, 7, 11, 15, 19]
        });
      }
    }

    if (skillParagon) {
      if (!campaignFeatSections.find((section) => section.id === "skillParagon")) {
        campaignFeatSections.push({
          id: "skillParagon",
          label: "pf2e-sf2e-extra-feat-slots.SETTINGS.skillParagon.label",
          supported: ["skill"],
          slots: [1]
        });
      }
    }

    if (magaambyaBenefits) {
      if (!campaignFeatSections.find((section) => section.id === "magaambyaBranches")) {
        campaignFeatSections.push({
          id: "magaambyaBranches",
          label: "pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.categories.branchLabel",
          slots: [1]
        });
        campaignFeatSections.push({
          id: "magaambyaBenefits",
          label: "pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.categories.benefitsLabel",
          slots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        });
        campaignFeatSections.push({
          id: "magaambyaBenefitsSecondary",
          label: "pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.categories.benefitsLabelSecondary",
          slots: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
        });
      }
    }

    if (custom) {
      if (!campaignFeatSections.find((section) => section.id === "custom")) {
        campaignFeatSections.push({
          id: "custom",
          label: game.settings.get(MODULE_ID, "customName"),
          slots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        });
      }
    }

    await game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
  }

  const campaignFeatSections = game.settings.get(game.system.id, "campaignFeatSections");

  // ... or remove it if disabled.
  if (
    campaignFeatSections &&
    !ancestryParagon &&
    campaignFeatSections.find((section) => section.id === "ancestryParagon")
  ) {
    campaignFeatSections.splice(
      campaignFeatSections.findIndex((section) => section.id === "ancestryParagon"),
      1,
    );
    await game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
  }

  if (
    campaignFeatSections &&
    !skillParagon &&
    campaignFeatSections.find(
      (section) => section.id === "skillParagon",
    )
  ) {
    campaignFeatSections.splice(
      campaignFeatSections.findIndex(
        (section) => section.id === "skillParagon",
      ),
      1,
    );
    await game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
  }

  if (
    campaignFeatSections &&
    !magaambyaBenefits &&
    campaignFeatSections.find(
      (section) => section.id === "magaambyaBranches",
    )
  ) {
    campaignFeatSections.splice(
      campaignFeatSections.findIndex(
        (section) => section.id === "magaambyaBranches",
      ),
      1,
    );
    campaignFeatSections.splice(
      campaignFeatSections.findIndex(
        (section) => section.id === "magaambyaBenefits",
      ),
      1,
    );
    campaignFeatSections.splice(
      campaignFeatSections.findIndex(
        (section) => section.id === "magaambyaBenefitsSecondary",
      ),
      1,
    );
    
    await game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
  }

  if (
    campaignFeatSections &&
    !custom &&
    campaignFeatSections.find((section) => section.id === "custom")
  ) {
    campaignFeatSections.splice(
      campaignFeatSections.findIndex((section) => section.id === "custom"),
      1,
    );
    await game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
  }
}

export function updateCustomFeats(){
    const customFeatSections = game.settings.get(MODULE_ID, "customFeatSections");

    if (customFeatSections) {
        // Grab the existing list of custom sections
        const campaignFeatSections = game.settings.get(game.system.id, "campaignFeatSections");

        // Remove old sections that no longer exist in our configs
        let updatedCampaignFeatSections = campaignFeatSections.filter( (section) => {
            const sectionSourceIsThisModule = section.id.startsWith("pf2e-sf2e-extra-feat-slots-");
            const sectionIsNotInCustomFeats = customFeatSections.findIndex((s) => s.id === section.id) === -1;
            const removeSection = sectionIsNotInCustomFeats && sectionSourceIsThisModule;
            return !removeSection;
        });

        // Add or update our custom sections
        //  Cycle through each section in our config
        //  Check the campaign feat sections list; compare id's to get the index of our section
        //  If our section doesn't exist (index -1), then we add our section
        //  If our section does exist (index > -1), when we replace it with a fresh version from our config to account for updates
        customFeatSections.forEach( (customSection) => {
            const idx = updatedCampaignFeatSections.findIndex((existingSection) => existingSection.id === customSection.id);
            if(idx < 0){
                updatedCampaignFeatSections.push(customSection);
            } else {
                updatedCampaignFeatSections[idx] = customSection; 
            }
        });

        // Update the setting
        game.settings.set(game.system.id, "campaignFeatSections", updatedCampaignFeatSections);
    }
}


Handlebars.registerHelper("pf2eSf2eExtraFeatSlotsFormatTagLabel", function (value) {
    const locKey = CONFIG.PF2E.featCategories[value];
    const formattedLabel = game.i18n.localize(locKey);
    return formattedLabel;
});