import {
  EntityType,
  ModCallback,
  PlayerType,
} from "isaac-typescript-definitions";
import {
  getNPCs,
  getPlayers,
  getRandomInt,
  hasLostCurse,
  isLost,
  setEntityOpacity,
} from "isaacscript-common";

const MOD_NAME = "birth";
const GREEN_CANDLE_COLLECTIBLE_TYPE = Isaac.GetItemIdByName("Green Candle");

// This function is run when your mod first initializes.
export function main(): void {
  // Instantiate a new mod object, which grants the ability to add callback functions that
  // correspond to in-game events.
  const mod = RegisterMod(MOD_NAME, 1);

  // Register a callback function that corresponds to when a new player is initialized.
  mod.AddCallback(ModCallback.POST_PLAYER_INIT, postPlayerInit);
  mod.AddCallback(ModCallback.POST_UPDATE, postUpdate);

  // Print a message to the "log.txt" file.
  Isaac.DebugString(`${MOD_NAME} initialized.`);
}

function postPlayerInit() {
  Isaac.DebugString("Callback fired: POST_PLAYER_INIT");
}

function postUpdate() {
  checkApplyGreenCandleEffect();
}

function checkApplyGreenCandleEffect() {
  for (const player of getPlayers()) {
    if (player.HasCollectible(GREEN_CANDLE_COLLECTIBLE_TYPE)) {
      applyGreenCandleEffect(player);
    }
  }
}

function applyGreenCandleEffect(player: EntityPlayer) {
  for (const npc of getNPCs()) {
    if (shouldApplyGreenCandleEffectToNPC(npc)) {
      if (npc.Type === EntityType.DELIRIUM) {
        if (getRandomInt(1, 10, undefined) !== 10) {
          continue;
        }
        Isaac.DebugString("exploding attempt started");
        const pos = npc.Position;
        npc.Die();
        Isaac.DebugString("de deli is ded");
        const currRoom = Game().GetRoom();
        currRoom.MamaMegaExplosion(pos);
        if (isLost(player) || hasLostCurse(player)) {
          player.Die();
        } else {
          player.ChangePlayerType(PlayerType.LOST);
        }
        Isaac.DebugString("exploding attempt done!");
        continue;
      }
      const effect = getRandomInt(1, 10, undefined);
      switch (effect) {
        case 1: {
          npc.AddPoison(EntityRef(player), 100, player.Damage);
          break;
        }

        case 2: {
          npc.AddBurn(EntityRef(player), 100, player.Damage * 2);
          break;
        }

        case 3: {
          npc.AddFreeze(EntityRef(player), 100);
          break;
        }

        case 4: {
          npc.AddConfusion(EntityRef(player), 100, false);
          break;
        }

        case 5: {
          npc.AddFear(EntityRef(player), 100);
          break;
        }

        case 6: {
          npc.AddMidasFreeze(EntityRef(player), 100);
          break;
        }

        case 7: {
          npc.AddShrink(EntityRef(player), 100);
          break;
        }

        case 8: {
          npc.AddSlowing(
            EntityRef(player),
            100,
            0.5,
            Color(1, 0, 0, 1, 0, 0, 0),
          );
          break;
        }

        case 9: {
          setEntityOpacity(npc, 0);
          break;
        }

        case 10: {
          if (getRandomInt(1, 2, undefined) === 2) {
            continue;
          }
          Isaac.DebugString("deli attempt started");
          Isaac.Spawn(
            EntityType.DELIRIUM,
            0,
            0,
            npc.Position,
            npc.Velocity,
            npc.Parent,
          );
          npc.Remove();
          Isaac.DebugString("deli attempt finished");
          break;
        }
      }
    }
  }
}

function shouldApplyGreenCandleEffectToNPC(npc: EntityNPC) {
  return npc.IsVulnerableEnemy() && getRandomInt(1, 500, undefined) === 1;
}
