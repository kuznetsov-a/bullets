# Bullet Heaven Game Specification

**Version:** 1.2  
**Target Platform:** Mobile Browser (primary), Desktop Browser (secondary)
**Interface:** Touch interface (on-screen joystick) for mobile, WASD for desktop
**Engine:** Phaser.js  
**Orientation:** Portrait (mobile)

---

## 1. Game Overview  
A **2D bullet heaven** game where the player fights endless waves of enemies, levels up, and acquires or upgrades weapons. The game supports **large maps, high enemy count, persistent game state, and random power-ups**.  

SVG Vector graphics for all game elements. No audio.
No menu screen. Start playing immediately.

---

## 2. Gameplay Mechanics  

### 2.1 Player  
- The player has **5 weapon slots** (fixed).  
- Weapons in slots are **independent** (same weapon can appear in multiple slots with separate upgrades).  
- UI displays:  
  - **Weapon slots and cooldowns**.  
  - **Player HP**.  
  - **Current Level & XP Progress**.  
- Movement via **touch on-screen joystick** (mobile) or **WASD keys** (desktop).  
- **Game Over** occurs when player HP reaches 0 or below.
- Player has **no special abilities** besides weapons.

### 2.2 Leveling System  
- XP is **automatically awarded** for enemy kills.  
- Level-up thresholds: **10, 20, 40, 80, 160, ...** (configurable).  
- Upon leveling up, the player chooses to:  
  - **Upgrade an existing weapon** (damage, cooldown).  
  - **Add a new weapon** (if slots are not full).  

### 2.3 Weapons  
Each weapon functions independently and tracks its own upgrades. All weapons are **auto-firing**.

| Weapon Type      | Behavior | Upgrades |
|------------------|----------|----------|
| **Bullet**        | Fires projectiles in a set direction. | Decrease cooldown, Increase damage |
| **Aura**         | Deals continuous damage in an area around the player. | Decrease cooldown, Increase damage |
| **Rotating Hammer** | Rotates around the player, damaging enemies on contact. | Decrease cooldown, Increase damage |
| **Whip**         | Swings in an arc, hitting multiple enemies. | Decrease cooldown, Increase damage |

- Weapons use Phaser's **Sprite & Timer systems**.  
- Cooldowns and attacks are displayed in the UI.  
- Weapons have **no ammunition limits**, only cooldowns.

### 2.4 Power-Ups  
- Random power-ups spawn after killing **X enemies** (configurable).  
- Power-up types:  
  - **Health Restore** (+HP).  
  - **Temporary Speed Boost**.  
  - **Temporary Fire Rate Boost**.  

---

## 3. Enemies & Spawning  

### 3.1 Enemy Types  
- Multiple enemy types with collision handling:  
  - **Basic Walker** – Moves toward player.  
  - **Fast Charger** – Moves quickly but low HP.  
  - **Tank** – Slow but high HP.  
  - **Shooter** – Fires projectiles at the player.  

### 3.2 Enemy Spawning  
- Spawn rate **increases by 10% per level** (configurable).
- Enemies **only scale in spawn rate** (not in strength/health).
- Uses **object pooling** to manage enemy creation/destruction.  
- **Enemies collide with each other and with obstacles**.  

---

## 4. Map System  

### 4.1 Large Map  
- The game world is **larger than the screen**, requiring camera movement.
- Map size is **200x200** (assuming player size is 1).
- The player is centered, and the camera follows smoothly.
- Maps are **randomly generated** each game.

### 4.2 Obstacles  
- Randomly placed obstacles that **cannot be destroyed**.  
- Affect movement and enemy pathfinding.
- Obstacles are **simple collision objects** with no special behaviors.
- Handled via **tilemap or sprite-based collision detection**.  

---

## 5. Performance Optimization  
- **Object pooling** for enemies, bullets, and power-ups.  
- **Culling** to avoid rendering offscreen elements.  
- **Physics & AI optimizations** for offscreen entities.  
- **WebGL optimizations** via Phaser's built-in sprite batching.  
- **Avoid reinventing the wheel** – Phaser handles all **input, rendering, physics**.  
- **Adaptive resolution** that responds to device screen size.

---

## 6. Game State & Persistence  

### 6.1 Local Storage for Resume Feature  
- Saves:  
  - **Player stats & level**  
  - **Current weapons & upgrades**  
  - **Enemy progression**  
- Autosaves every **10 seconds** (configurable).  
- Force browser to pull the code from the server each refresh, no caching.
- Game state persists between browser sessions.

---

## 7. Code Architecture  

### 7.1 Class Structure  

| Class | Responsibility |
|-------|---------------|
| `Player` | Manages movement, HP, weapons, XP. |
| `Weapon` | Base class for all weapons, handling cooldowns and firing. |
| `BulletWeapon`, `AuraWeapon`, `HammerWeapon`, `WhipWeapon` | Specific implementations of each weapon type. |
| `Monster` | Handles AI, movement, collisions. |
| `Spawner` | Manages enemy spawning logic. |
| `GameState` | Handles saving/loading data. |
| `UIManager` | Manages HUD elements (HP, XP, cooldowns). |

- Uses Phaser's **built-in physics and input handling**.  
- **Highly modular** – new weapons, enemies, and power-ups can be added without breaking core functionality.  

---

## 8. Configurable Parameters  

| Parameter | Default | Description |
|-----------|---------|-------------|
| Max Weapons | `5` | Fixed weapon slots. |
| Level XP Steps | `[10, 20, 40, 80, 160, ...]` | XP needed per level. |
| Enemy Spawn Rate Growth | `1.1` (10%) | Increase in spawn rate per level. |
| Autosave Interval | `10 sec` | Frequency of game state saving. |
| Power-Up Spawn Rate | `Every 50 kills` | How often power-ups spawn. |
| Weapon Stats | Configurable | Damage, cooldown, etc. per weapon type. |
| Map Size | `200x200` | Size of the game world. |

---

## 9. Summary  
- **Endless survival game** with modular weapons and enemies.
- **Game over** when player HP reaches 0.
- **Random obstacles** on a **randomly generated large map** with **player-centered camera**.
- **Persistent state** via local storage.
- **Adaptive resolution** for different screen sizes, targeted for mobile portrait orientation.
- **High performance**, leveraging Phaser's built-in **physics, rendering, and input handling**.  

This document is **AI-code-generator-friendly**, ensuring structured code output.
