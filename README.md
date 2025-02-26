# Bullet Heaven

A 2D bullet heaven game where you fight endless waves of enemies, level up, and acquire or upgrade weapons.

## Features

- **Multiple Weapon Types**: Bullets, Auras, Rotating Hammers, and Whips
- **Endless Waves**: Fight increasingly difficult waves of enemies
- **Leveling System**: Gain XP and level up to upgrade weapons or acquire new ones
- **Large Map**: Explore a world larger than the screen with a player-centered camera
- **Random Power-ups**: Collect power-ups for temporary boosts
- **Persistent Game State**: Your progress is automatically saved

## Controls

### Desktop
- **WASD** or **Arrow Keys**: Move the player
- **Mouse**: Aim weapons

### Mobile
- **Touch and Drag**: Move the player
- Weapons automatically aim in the direction of movement

## Weapons

1. **Bullet**: Fires projectiles in a set direction
2. **Aura**: Deals continuous damage in an area around the player
3. **Rotating Hammer**: Rotates around the player, damaging enemies on contact
4. **Whip**: Swings in an arc, hitting multiple enemies

## Enemies

1. **Walker**: Basic enemy that moves toward the player
2. **Charger**: Fast but has low HP
3. **Tank**: Slow but has high HP
4. **Shooter**: Fires projectiles at the player

## Power-ups

1. **Health**: Restores player HP
2. **Speed**: Temporarily increases movement speed
3. **Fire Rate**: Temporarily increases weapon fire rate

## How to Play

1. Open `index.html` in a web browser
2. Click "New Game" to start a new game or "Continue" to resume a saved game
3. Move around to avoid enemies and let your weapons automatically attack
4. Collect XP by defeating enemies to level up
5. Choose upgrades when you level up
6. Collect power-ups to gain temporary advantages
7. Survive as long as possible!

## Development

This game is built using [Phaser 3](https://phaser.io/phaser3), a powerful HTML5 game framework.

### Project Structure

- `index.html`: Main HTML file
- `js/`: JavaScript files
  - `config.js`: Game configuration
  - `main.js`: Game initialization
  - `entities/`: Player and enemy classes
  - `weapons/`: Weapon classes
  - `managers/`: Game state, UI, and spawner managers
  - `scenes/`: Game scenes
  - `utils/`: Utility classes

## Credits

- Game Design: Based on the Bullet Heaven specification
- Engine: [Phaser 3](https://phaser.io/phaser3)

## License

This project is open source and available under the MIT License. 