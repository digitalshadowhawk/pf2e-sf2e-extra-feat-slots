# PF2e/SF2e Extra Feat Slots
<img src="https://img.shields.io/github/v/release/digitalshadowhawk/pf2e-sf2e-extra-feat-slots?style=for-the-badge&amp;logo=foundryvirtualtabletop&amp;logoColor=white&amp;logoSize=auto" alt="GitHub release" /> <img src="https://img.shields.io/github/downloads/digitalshadowhawk/pf2e-sf2e-extra-feat-slots/total?style=for-the-badge&amp;logo=foundryvirtualtabletop&amp;logoColor=white&amp;logoSize=auto" alt="GitHub all releases" /> <img src="https://img.shields.io/github/license/digitalshadowhawk/pf2e-sf2e-extra-feat-slots?style=for-the-badge&amp;logo=foundryvirtualtabletop&amp;logoColor=white&amp;logoSize=auto" alt="Github License" />

<img src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dfor-the-badge%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2Fdigitalshadowhawk%2Fpf2e-sf2e-extra-feat-slots%2Frefs%2Fheads%2Fmain%2Fmodule.json" alt="Foundry Version" /> <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fsystem%3FnameType%3Dshort%26showVersion%3D1%26style%3Dfor-the-badge%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2Fdigitalshadowhawk%2Fpf2e-sf2e-extra-feat-slots%2Frefs%2Fheads%2Fmain%2Fmodule.json" alt="Foundry Version" />

This module aims to add extra feat slots for assorted variant rules and subsystems including:
- Ancestry Paragon
<img width="1176" height="401" alt="image" src="https://github.com/user-attachments/assets/8e3efaf9-89f0-460e-bfbe-66fea8d44279" />

- Skill Paragon
<img width="1171" height="433" alt="image" src="https://github.com/user-attachments/assets/cbd92716-ff85-4b41-ab59-21a301cb7748" />

- Magaambya Branch Benefits
<img width="1164" height="1942" alt="image" src="https://github.com/user-attachments/assets/7e3d46aa-d4ca-43c7-9e4d-64b8c09c9165" />


~~Additionally, it includes compendiums of feats for PF2e and SF2e that will grant all the relevant skill feats for Skill Paragon at the appropriate levels and prerequisite unlocks.~~
As of version 0.2.0, these compendiums shouldn't be used, and you should instead use the macro that will dynamically generate a dummy feat with all relevant feats from all available sources that have been added to this module's sources.

For feats to use with the Magaambya Branch Benefit feat slots, see https://foundryvtt.com/packages/pf2e-magaambya

To use, simply enable the module, open the feaat section editor, and add whatever sections you need. Currently there are three presets, Ancestry Paragon, Skill Paragon, and Magaambya Branch Benefits
<img width="1176" height="1030" alt="image" src="https://github.com/user-attachments/assets/44e9c05a-0c51-4ddd-a716-582ec2103da6" />
<img width="1350" height="825" alt="image" src="https://github.com/user-attachments/assets/065fa7ed-61f6-445e-840b-5120266d1f22" />


# Troubleshooting

**Help! I disabled the module and there are extra feat sections with weird names!**
<img width="1207" height="734" alt="image" src="https://github.com/user-attachments/assets/6da2c18b-a4d4-44c7-81a6-ac4b31e5a437" />
Unfortunately due to limitations of Foundry, this module can't run its cleanup code when the module is disabled. To get rid of these sections, you have two options:
- re-enable the module, delete the relevant sections in the module's settings, then disable the module again
- run the following code as a script macro (this only works for the old sections created prior to version 0.1.0)

```javascript
const campaignFeatSections = game.settings.get(game.system.id, "campaignFeatSections");

  if (
    campaignFeatSections &&
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
    campaignFeatSections.find(
      (section) => section.id === "custom",
    )
  ) {
    campaignFeatSections.splice(
      campaignFeatSections.findIndex(
        (section) => section.id === "custom",
      ),
      1,
    );
    await game.settings.set(game.system.id, "campaignFeatSections", campaignFeatSections);
  }
```
