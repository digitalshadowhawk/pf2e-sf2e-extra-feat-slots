Hooks.on('init', function() {
	game.settings.register("pf2e-sf2e-extra-feat-slots", "ancestryParagon", {
		name: "pf2e-sf2e-extra-feat-slots.SETTINGS.ancestryParagon.name",
        hint: "pf2e-sf2e-extra-feat-slots.SETTINGS.ancestryParagon.hint",
		scope: "world",
		config: "true",
    requiresReload: true,
		default: "false",
		type: Boolean
	});
	game.settings.register("pf2e-sf2e-extra-feat-slots", "skillParagon", {
		name: "pf2e-sf2e-extra-feat-slots.SETTINGS.skillParagon.name",
        hint: "pf2e-sf2e-extra-feat-slots.SETTINGS.skillParagon.hint",
		scope: "world",
		config: "true",
    requiresReload: true,
		default: "false",
		type: Boolean
	});
	game.settings.register("pf2e-sf2e-extra-feat-slots", "magaambyaBenefits", {
		name: "pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.name",
        hint: "pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.hint",
		scope: "world",
		config: "true",
    requiresReload: true,
		default: "false",
		type: Boolean
	});
});

Hooks.once("ready", () => {
    variantFeats();
});

async function variantFeats() {
  const ancestryParagon = game.settings.get("pf2e-sf2e-extra-feat-slots", "ancestryParagon");
  const skillParagon = game.settings.get("pf2e-sf2e-extra-feat-slots", "skillParagon");
  const magaambyaBenefits = game.settings.get("pf2e-sf2e-extra-feat-slots", "magaambyaBenefits");

  // Add campaign feat sections if enabled
  if (ancestryParagon || skillParagon || magaambyaBenefits) {
    const campaignFeatSections = game.settings.get("pf2e", "campaignFeatSections");
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
          //supported: ["class"],
          slots: [1]
        });
        campaignFeatSections.push({
          id: "magaambyaBenefits",
          label: "pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.categories.benefitsLabel",
          //supported: ["skill"],
          slots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        });
        campaignFeatSections.push({
          id: "magaambyaBenefitsSecondary",
          label: "pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.categories.benefitsLabelSecondary",
          //supported: ["skill"],
          slots: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
        });
      }
    }

    await game.settings.set("pf2e", "campaignFeatSections", campaignFeatSections);
  }

  const campaignFeatSections = game.settings.get("pf2e", "campaignFeatSections");
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
    await game.settings.set("pf2e", "campaignFeatSections", campaignFeatSections);
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
    await game.settings.set("pf2e", "campaignFeatSections", campaignFeatSections);
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
    await game.settings.set("pf2e", "campaignFeatSections", campaignFeatSections);
  }
}