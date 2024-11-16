import { BattlerIndex } from "#app/battle";
import { Moves } from "#app/enums/moves";
import { Species } from "#app/enums/species";
import { Abilities } from "#enums/abilities";
import GameManager from "#test/utils/gameManager";
import Phaser from "phaser";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("Moves - Dragon Darts", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;
  beforeAll(() => {
    phaserGame = new Phaser.Game({
      type: Phaser.HEADLESS,
    });
  });

  afterEach(() => {
    game.phaseInterceptor.restoreOg();
  });

  beforeEach(() => {
    game = new GameManager(phaserGame);
    game.override
      .battleType("double")
      .enemySpecies(Species.MAGIKARP)
      .enemyAbility(Abilities.BALL_FETCH)
      .enemyMoveset(Moves.SPLASH)
      .enemyLevel(100)
      .starterSpecies(Species.MAGIKARP)
      .moveset([ Moves.DRAGON_DARTS, Moves.SPLASH ]);
  });

  it("hits each enemy once in a double battle", async () => {
    await game.classicMode.startBattle([ Species.MAGIKARP, Species.MAGIKARP ]);

    const [ pokemon1 ] = game.scene.getPlayerField();
    const [ enemy1, enemy2 ] = game.scene.getEnemyField();

    game.move.select(Moves.DRAGON_DARTS, 0);
    game.move.select(Moves.SPLASH, 1);

    await game.setTurnOrder([ BattlerIndex.PLAYER, BattlerIndex.PLAYER_2, BattlerIndex.ENEMY, BattlerIndex.ENEMY_2 ]);
    await game.phaseInterceptor.to("MoveEffectPhase");

    expect(pokemon1.turnData.hitCount).toBe(1);
    expect(enemy1.hp).toBeLessThan(enemy1.getMaxHp());
    expect(enemy2.hp).toBeLessThan(enemy2.getMaxHp());
  });

  it("hits the enemy twice in a single battle", async () => {
    game.override.battleType("single");
    await game.classicMode.startBattle([ Species.MAGIKARP ]);

    const [ pokemon ] = game.scene.getPlayerField();
    const [ enemy ] = game.scene.getEnemyField();

    game.move.select(Moves.DRAGON_DARTS);

    await game.setTurnOrder([ BattlerIndex.PLAYER, BattlerIndex.ENEMY ]);
    await game.phaseInterceptor.to("MoveEffectPhase");

    expect(pokemon.turnData.hitCount).toBe(2);
    expect(enemy.hp).toBeLessThan(enemy.getMaxHp());
  });
});
