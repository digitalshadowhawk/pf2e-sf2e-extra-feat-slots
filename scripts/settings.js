export const MODULE_ID = "pf2e-sf2e-extra-feat-slots";
import { BonusFeatsConfig } from "./BonusFeatsConfig.js";

export function registerSettings() {
    game.settings.register("pf2e-sf2e-extra-feat-slots", "ancestryParagon", {
		name: "pf2e-sf2e-extra-feat-slots.SETTINGS.ancestryParagon.name",
    	hint: "pf2e-sf2e-extra-feat-slots.SETTINGS.ancestryParagon.hint",
		scope: "world",
		config: false,
    	requiresReload: true,
		default: false,
		type: Boolean
	});
	game.settings.register("pf2e-sf2e-extra-feat-slots", "skillParagon", {
		name: "pf2e-sf2e-extra-feat-slots.SETTINGS.skillParagon.name",
   		hint: "pf2e-sf2e-extra-feat-slots.SETTINGS.skillParagon.hint",
		scope: "world",
		config: false,
   		requiresReload: true,
		default: "false",
		type: Boolean
	});
    game.settings.register("pf2e-sf2e-extra-feat-slots", "magaambyaBenefits", {
	  	name: "pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.name",
      	hint: "pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.hint",
		scope: "world",
		config: false,
      	requiresReload: true,
		default: "false",
		type: Boolean
	});
  	game.settings.register("pf2e-sf2e-extra-feat-slots", "custom", {
		name: "pf2e-sf2e-extra-feat-slots.SETTINGS.custom.name",
    	hint: "pf2e-sf2e-extra-feat-slots.SETTINGS.custom.hint",
		scope: "world",
		config: false,
    	requiresReload: true,
		default: "false",
		type: Boolean
	});
  	game.settings.register("pf2e-sf2e-extra-feat-slots", "customName", {
		name: "pf2e-sf2e-extra-feat-slots.SETTINGS.customName.name",
    	hint: "pf2e-sf2e-extra-feat-slots.SETTINGS.customName.hint",
		scope: "world",
		config: false,
    	requiresReload: false,
		default: "Custom Feat Section",
		type: String,
    	onChange: (value) => {
      		const campaignFeatSections = game.settings.get(game.system.id, "campaignFeatSections")
      		campaignFeatSections[campaignFeatSections.findIndex((section) => section.id === "custom")].label = value;
      		game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
    	}
	});
    game.settings.registerMenu(MODULE_ID, "featsConfigEditor", {
        name: "Configure Bonus Feats",
        label: "Configure Bonus Feats",
        icon: "fas fa-wrench",
        type: BonusFeatsConfig,
        restricted: true,
        requiresReload: true,
        hint: "Configure additional feat sections to display on the feats tab of PC sheets. Choose what type of feats can go in each section, and what levels you get them at."
    });

    game.settings.register(MODULE_ID, 'customFeatSections', {
        scope: 'world',
        config: false,
        type: Object,
        default: [],
    }); 
}