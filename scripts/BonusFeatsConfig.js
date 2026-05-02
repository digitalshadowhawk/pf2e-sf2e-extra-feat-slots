import { updateCustomFeats } from "./module.js";
import { MODULE_ID } from "./settings.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class BonusFeatsConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(object, options) {
        super(object, options);
        const moduleSettings = foundry.utils.duplicate(game.settings.get(MODULE_ID, "customFeatSections")) || [];
        this.featSections = moduleSettings || [];
    }

    static DEFAULT_OPTIONS = {
        id: "pf2e-sf2e-extra-feat-slots-edit-feat-sections",
        classes: ["edit-feat-sections", "pf2e-sf2e-extra-feat-slots"],
        window: {
            contentClasses: ["standard-form"],
            resizable: true,
            title: "pf2e-sf2e-extra-feat-slots.SETTINGS.config.title",
        },
        position: {
            width: 900
        },
        actions: {
            addSection: BonusFeatsConfig.addFeatSection,
            editSection: BonusFeatsConfig.editFeatSection,
            removeSection: BonusFeatsConfig.removeFeatSection,
            saveSections: BonusFeatsConfig.saveFeatSections,
            addPreset: BonusFeatsConfig.addPreset
        },
    };

    static PARTS = {
        main: {
            root: true,
            template: "modules/pf2e-sf2e-extra-feat-slots/templates/feat-config.hbs",
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.featSections = this.featSections;
        return context;
    }

    static async addPreset(event) {
        const presetToAdd = document.getElementById("sectionPresets").value;
        const toSlots = levels => levels.map(level => ({ id: foundry.utils.randomID(), level }));

        if(presetToAdd === "ancestryParagon") {
            let newSection = {
                id: "pf2e-sf2e-extra-feat-slots-ancestry-paragon",
                label: game.i18n.localize("pf2e-sf2e-extra-feat-slots.SETTINGS.ancestryParagon.label"),
                supported: ["ancestry"],
                slots: toSlots([1, 3, 7, 11, 15, 19])
            };
            this.featSections.push(newSection);
            this.render(true);
        }
        if(presetToAdd === "skillParagon") {
            let newSection = {
                id: "pf2e-sf2e-extra-feat-slots-skill-paragon",
                label: game.i18n.localize("pf2e-sf2e-extra-feat-slots.SETTINGS.skillParagon.label"),
                supported: ["bonus"],
                slots: toSlots([1])
            };
            this.featSections.push(newSection);
            this.render(true);
        }
        if(presetToAdd === "magaambyaBenefits") {
            let newSection1 = {
                id: "pf2e-sf2e-extra-feat-slots-magaambya-branches",
                label: game.i18n.localize("pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.categories.branchLabel"),
                supported: ["bonus"],
                slots: toSlots([1])
            };
            let newSection2 = {
                id: "pf2e-sf2e-extra-feat-slots-magaambya-benefits",
                label: game.i18n.localize("pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.categories.benefitsLabel"),
                supported: ["bonus"],
                slots: toSlots([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
            };
            let newSection3 = {
                id: "pf2e-sf2e-extra-feat-slots-magaambya-benefits-secondary",
                label: game.i18n.localize("pf2e-sf2e-extra-feat-slots.SETTINGS.magaambyaBenefits.categories.benefitsLabelSecondary"),
                supported: ["bonus"],
                slots: toSlots([2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
            };
            this.featSections.push(newSection1);
            this.featSections.push(newSection2);
            this.featSections.push(newSection3);
            this.render(true);
        }
    }

    static async addFeatSection(event) {
        const labelField = new foundry.data.fields.StringField({label: "Section Label", initial: "New Section", required: true}).toFormGroup({},{name:"label"}).outerHTML;      
        
        const featTypeOptions = Object.keys(CONFIG.PF2E.featCategories).map(key => ({value:key, label:game.i18n.localize(CONFIG.PF2E.featCategories[key]), selected: false}));
        const typeCheckboxes = foundry.applications.fields.createMultiSelectInput({type: "checkboxes", name: "supported", options: featTypeOptions });
        const supportedField = foundry.applications.fields.createFormGroup({label: "Allowed Feat Types", input: typeCheckboxes}).outerHTML;
        
        const slotsHint = "Leaving this blank will not populate level based slots into the section. Otherwise, it expects a comma separated list. Entering the same number more than once will add additional slots at that level. Ex: 1, 1, 5, 7";
        const slotsField = new foundry.data.fields.StringField({label: "Grant At Levels", hint: slotsHint}).toFormGroup({},{name:"slots"}).outerHTML;
        let content = labelField + supportedField + slotsField;

        foundry.applications.api.DialogV2.wait({
            id: "pf2e-sf2e-extra-feat-slots-add-section-dialog",
            window: {
                title: `Add Section`,
            },
            position: {
                width: 600
            },
            content,
            buttons: [{
                action: "automatic",
                label: "Add",
                icon: "fa-regular fa-plus",
                callback: async (event, button) => {
                    const data = new foundry.applications.ux.FormDataExtended(button.form).object;
                    const newID = "pf2e-sf2e-extra-feat-slots-" + foundry.utils.randomID()
                    
                    let newSection = {
                        id: newID,
                        label: data.label || "Custom Feat Section",
                        supported: !data.supported ? [] : data.supported,
                        slots: !data.slots ? [] : data.slots.split(/,\s*/).map(Number).sort(function(a, b) {return a - b;}).map(level => ({ id: newID + "-" + foundry.utils.randomID(), level }))
                    };

                    this.featSections.push(newSection);
                    this.render(true);
                },
                default: false
            }],
        });
    }

    static async editFeatSection(event) {
        const sectionIdToEdit = event.target.dataset.sectionId;
        let sectionToEdit = foundry.utils.duplicate(this.featSections.filter(s => s.id === sectionIdToEdit)[0]);
        
        const labelField = new foundry.data.fields.StringField({label: "Section Label", initial: sectionToEdit.label, required: true}).toFormGroup({},{name:"label"}).outerHTML;      
        
        const featTypeOptions = Object.keys(CONFIG.PF2E.featCategories).map(key => ({value:key, label:game.i18n.localize(CONFIG.PF2E.featCategories[key]), selected: sectionToEdit.supported.includes(key)}));
        const typeCheckboxes = foundry.applications.fields.createMultiSelectInput({type: "checkboxes", name: "supported", options: featTypeOptions });
        const supportedField = foundry.applications.fields.createFormGroup({label: "Allowed Feat Types", input: typeCheckboxes}).outerHTML;
        
        const slotsHint = "Leaving this blank will not populate level based slots into the section. Otherwise, it expects a comma separated list. Entering the same number more than once will add additional slots at that level. Ex: 1, 1, 5, 7";
        const slotsField = new foundry.data.fields.StringField({label: "Grant At Levels", hint: slotsHint, initial: sectionToEdit.slots.map(s => s.level)}).toFormGroup({},{name:"slots"}).outerHTML;
        let content = labelField + supportedField + slotsField;

        foundry.applications.api.DialogV2.wait({
            id: "pf2e-sf2e-extra-feat-slots-edit-section-dialog",
            window: {
                title: `Edit Section`,
            },
            position: {
                width: 600
            },
            content,
            buttons: [{
                action: "automatic",
                label: "Edit",
                icon: "fa-regular fa-pencil",
                callback: async (event, button) => {
                    const data = new foundry.applications.ux.FormDataExtended(button.form).object;
                    
                    let newSection = {
                        id: sectionIdToEdit,
                        label: data.label || "Custom Feat Section",
                        supported: !data.supported ? [] : data.supported,
                        slots: !data.slots ? [] : data.slots.split(/,\s*/).map(Number).sort(function(a, b) {return a - b;}).map(level => ({ id: sectionToEdit + "-" + foundry.utils.randomID(), level }))
                    };

                    const idx = this.featSections.findIndex(s => s.id === sectionIdToEdit);
                    if(idx === -1) return;
                    this.featSections[idx] = newSection;
                    this.render(true);
                },
                default: false
            }],
        });
    }

    static removeFeatSection(event) {
        let sectionIdToRemove = event.target.dataset.sectionId;
        this.featSections = this.featSections.filter( (section) => {
            return section.id !== sectionIdToRemove;
        });
        this.render(true);
    }

    static async removeOldFeatSections() {
        
        
        const ancestryParagon = game.settings.get(MODULE_ID, "ancestryParagon");
        const skillParagon = game.settings.get(MODULE_ID, "skillParagon");
        const magaambyaBenefits = game.settings.get(MODULE_ID, "magaambyaBenefits");
        const custom = game.settings.get(MODULE_ID, "custom");
        const campaignFeatSections = game.settings.get(game.system.id, "campaignFeatSections");

  // ... or remove it if disabled.
  if (
    campaignFeatSections &&
    ancestryParagon &&
    campaignFeatSections.find((section) => section.id === "ancestryParagon")
  ) {
    game.settings.set(MODULE_ID, "ancestryParagon", false);
    campaignFeatSections.splice(
      campaignFeatSections.findIndex((section) => section.id === "ancestryParagon"),
      1,
    );
    await game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
  }

  if (
    campaignFeatSections &&
    skillParagon &&
    campaignFeatSections.find(
      (section) => section.id === "skillParagon",
    )
  ) {
    game.settings.set(MODULE_ID, "skillParagon", false);
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
    magaambyaBenefits &&
    campaignFeatSections.find(
      (section) => section.id === "magaambyaBranches",
    )
  ) {
    game.settings.set(MODULE_ID, "magaambyaBenefits", false);
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

  if (
    campaignFeatSections &&
    custom &&
    campaignFeatSections.find(
      (section) => section.id === "custom",
    )
  ) {
    game.settings.set(MODULE_ID, "custom", false);
    campaignFeatSections.splice(
      campaignFeatSections.findIndex(
        (section) => section.id === "custom",
      ),
      1,
    );
    await game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
  }
    
    await game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
  }
    }

    static async saveFeatSections(event) {
        await game.settings.set(MODULE_ID, "customFeatSections", this.featSections); 
        updateCustomFeats();
        ui.notifications.notify("Feat sections updated. Changes should be visible on all sheets immediately.");
        this.close();
    }
}