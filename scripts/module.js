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


Handlebars.registerHelper("pf2eSf2eExtraFeatSotsFormatTagLabel", function (value) {
    const locKey = CONFIG.PF2E.featCategories[value];
    const formattedLabel = game.i18n.localize(locKey);
    return formattedLabel;
});