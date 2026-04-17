import { Scene, Engine, Keys, Color, Label, Font, FontUnit, TextAlign, vec } from 'excalibur';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/sprites';
import { LevelScene } from './LevelScene';
import { GameState } from '../engine/GameState';

export class VictoryScene extends Scene {
  onInitialize(engine: Engine): void {
    const bg = new Label({
      text: '',
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      color: Color.White,
    });
    this.add(bg);

    const title = new Label({
      text: '🎩 You collected all hats! 🎩',
      pos: vec(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60),
      font: new Font({
        size: 36,
        unit: FontUnit.Px,
        textAlign: TextAlign.Center,
        color: Color.fromHex('#CC4400'),
      }),
    });
    this.add(title);

    const sub = new Label({
      text: 'Press R or Enter to play again',
      pos: vec(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20),
      font: new Font({
        size: 22,
        unit: FontUnit.Px,
        textAlign: TextAlign.Center,
        color: Color.fromHex('#333333'),
      }),
    });
    this.add(sub);

    void engine;
  }

  onPreUpdate(engine: Engine, _elapsed: number): void {
    const kb = engine.input.keyboard;
    if (kb.wasPressed(Keys.R) || kb.wasPressed(Keys.Enter)) {
      this._restartGame(engine);
    }
  }

  private _restartGame(engine: Engine): void {
    GameState.reset();
    const key = 'level-0';
    if (!engine.scenes[key]) {
      engine.addScene(key, new LevelScene(0));
    }
    void engine.goToScene(key);
  }
}
