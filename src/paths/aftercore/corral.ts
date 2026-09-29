import { cliExecute, haveEffect, use, visitUrl } from "kolmafia";
import {
  $effect,
  $item,
  $location,
  $monster,
  $monsters,
  $skill,
  AsdonMartin,
  get,
  have,
  Macro,
  questStep,
  set,
} from "libram";
import { CombatStrategy } from "../../engine/combat";
import { Quest } from "../../engine/task";

export const CorralUnlockQuest: Quest = {
  name: "Corral Unlock",
  tasks: [
    {
      name: "Driving Waterproofly",
      completed: () => haveEffect($effect`Driving Waterproofly`) >= 1000,
      do: () => AsdonMartin.drive($effect`Driving Waterproofly`, 1800),
      limit: { tries: 1 },
      freeaction: true,
    },

    {
      name: "Fishy",
      completed: () => have($effect`Fishy`),
      do: () => use($item`fishy pipe`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Start Sea Quest",
      ready: () => questStep("questS01OldGuy") === -1,
      completed: () => questStep("questS01OldGuy") === 0,
      do: () => visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Fishy Charging",
      after: ["Fishy", "Driving Waterproofly", "Driving Waterproofly"],
      ready: () => questStep("questS01OldGuy") === 0,
      completed: () => get("_shivHomesteaderFishyPrepped", false),
      do: $location`The Briniest Deepests`,
      outfit: { modifier: "cold resist" },
      post: (): void => {
        if (haveEffect($effect`Fishy`) >= 60) set("_shivHomesteaderFishyPrepped", true);
      },
      combat: new CombatStrategy().ignore($monsters`decent white shark, ganger`).kill(),
      peridot: $monster`acoustic electric eel`,
      parachute: $monster`acoustic electric eel`,
      limit: { tries: 20 },
    },
    {
      name: "Get Wriggling Flytrap",
      after: ["Fishy Charging", "Start Sea Quest"],
      ready: () => questStep("questS01OldGuy") === 0,
      completed: () => have($item`wriggling flytrap pellet`) || questStep("questS02Monkees") >= 0,
      do: $location`An Octopus's Garden`,
      combat: new CombatStrategy()
        .macro(new Macro().trySkill($skill`Transcendent Olfaction`), $monster`Neptune flytrap`)
        .ignore($monsters`octopus gardener, sponge, stranglin' algae`)
        .kill(),
      peridot: $monster`Neptune flytrap`,
      parachute: $monster`Neptune flytrap`,
      limit: { tries: 15 },
    },
    {
      name: "Use Wriggling Flytrap",
      after: ["Fishy Charging", "Get Wriggling Flytrap"],
      ready: () => questStep("questS01OldGuy") === 0,
      completed: () => questStep("questS02Monkees") >= 0,
      do: () => use($item`wriggling flytrap pellet`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Talk to Little Brother",
      after: ["Use Wriggling Flytrap"],
      ready: () => questStep("questS02Monkees") === 0,
      completed: () => questStep("questS02Monkees") >= 1,
      do: () => visitUrl("monkeycastle.php?who=1"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Open Hatch",
      after: ["Talk to Little Brother"],
      ready: () => questStep("questS02Monkees") === 1,
      completed: () => get("bigBrotherRescued"),
      do: $location`The Wreck of the Edgar Fitzsimmons`,
      outfit: { modifier: "-combat" },
      choices: { 299: 1 },
      combat: new CombatStrategy().ignore(),
      limit: { tries: 15 },
    },
    {
      name: "Talk to Big Brother",
      after: ["Open Hatch"],
      ready: () => questStep("questS02Monkees") === 2,
      completed: () => questStep("questS02Monkees") >= 3,
      do: () => visitUrl("monkeycastle.php?who=2"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Talk to Little Brother 2",
      after: ["Talk to Big Brother"],
      ready: () => questStep("questS02Monkees") === 3,
      completed: () => get("mapToTheMarinaraTrenchPurchased") && questStep("questS02Monkees") >= 4,
      do: () => visitUrl("monkeycastle.php?who=1"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Find Grandpa",
      after: ["Talk to Little Brother 2"],
      ready: () => questStep("questS02Monkees") === 4,
      completed: () => questStep("questS02Monkees") >= 5,
      do: $location`The Marinara Trench`,
      outfit: { modifier: "-combat" },
      combat: new CombatStrategy().ignore(),
      limit: { tries: 20 },
    },
    {
      name: "Ask Grandpa About Wife",
      after: ["Find Grandpa"],
      ready: () => questStep("questS02Monkees") === 5,
      completed: () => questStep("questS02Monkees") >= 6,
      do: () => cliExecute("grandpa wife"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Get Lockkey",
      after: ["Ask Grandpa About Wife"],
      ready: () => questStep("questS02Monkees") >= 6,
      completed: () => get("merkinLockkeyMonster") !== null,
      do: $location`The Mer-Kin Outpost`,
      outfit: { modifier: "+combat" },
      combat: new CombatStrategy().kill(),
      limit: { tries: 30 },
    },
    {
      name: "Get Stashbox",
      after: ["Get Lockkey"],
      ready: () => have($item`Mer-kin lockkey`),
      prepare: (): void => {
        if (get("_shivMerkinTentChoice") === "") {
          set("_shivMerkinTentChoice", 1);
        }
        if (get("_shivMerkinTentChoice", 1) >= 4) {
          throw `We didn't find the stashbox in any of the NCs! What happened?`;
        }
        set("choiceAdventure313", get("_shivMerkinTentChoice"));
        set("choiceAdventure314", get("_shivMerkinTentChoice"));
        set("choiceAdventure315", get("_shivMerkinTentChoice"));
      },
      completed: () =>
        have($item`Mer-kin stashbox`) || have($item`Mer-kin trailmap`) || get("intenseCurrents"),
      do: $location`The Mer-Kin Outpost`,
      outfit: { modifier: "-combat" },
      combat: new CombatStrategy().ignore(),
      post: (): void => {
        if (
          get("lastEncounter") === "Aggressive Intent" ||
          get("lastEncounter") === "Mysterious Intent" ||
          get("lastEncounter") === "Sneaky Intent"
        )
          set("_shivMerkinTentChoice", get("_shivMerkinTentChoice", 1) + 1);
      },
      limit: { tries: 15 },
    },
    {
      name: "Open Stashbox",
      after: ["Get Stashbox"],
      ready: () => have($item`Mer-kin stashbox`),
      completed: () => have($item`Mer-kin trailmap`) || get("intenseCurrents"),
      do: () => use($item`Mer-kin stashbox`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Use trailmap",
      after: ["Open Stashbox"],
      ready: () => have($item`Mer-kin trailmap`),
      completed: () => get("intenseCurrents"),
      do: () => use($item`Mer-kin trailmap`),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Unlock Corral",
      after: ["Use trailmap"],
      ready: () => get("intenseCurrents"),
      completed: () => get("corralUnlocked"),
      do: () => cliExecute("grandpa currents"),
      limit: { tries: 1 },
      freeaction: true,
    },
    {
      name: "Ensure Expert Lasso",
      after: ["Unlock Corral"],
      ready: () => get("corralUnlocked"),
      completed: () => get("lassoTraining") === "expertly",
      do: $location`The Briniest Deepests`,
      combat: new CombatStrategy().ignore($monsters`decent white shark, ganger`).kill(),
      limit: { tries: 5 },
    },
  ],
};
