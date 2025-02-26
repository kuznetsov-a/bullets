# Create audio files
New-Item -ItemType File -Path "assets/audio/music-main.mp3" -Force
New-Item -ItemType File -Path "assets/audio/sound-shoot.mp3" -Force
New-Item -ItemType File -Path "assets/audio/sound-hit.mp3" -Force
New-Item -ItemType File -Path "assets/audio/sound-level-up.mp3" -Force
New-Item -ItemType File -Path "assets/audio/sound-powerup.mp3" -Force

# Create image files
New-Item -ItemType File -Path "assets/images/ui-hp-bar.png" -Force
New-Item -ItemType File -Path "assets/images/ui-xp-bar.png" -Force
New-Item -ItemType File -Path "assets/images/map-background.png" -Force
New-Item -ItemType File -Path "assets/images/obstacle.png" -Force
New-Item -ItemType File -Path "assets/images/menu-background.png" -Force
New-Item -ItemType File -Path "assets/images/button.png" -Force
New-Item -ItemType File -Path "assets/images/level-up-background.png" -Force
New-Item -ItemType File -Path "assets/images/level-up-option.png" -Force
New-Item -ItemType File -Path "assets/images/loading-background.png" -Force
New-Item -ItemType File -Path "assets/images/loading-bar.png" -Force
New-Item -ItemType File -Path "assets/images/enemy-walker.png" -Force
New-Item -ItemType File -Path "assets/images/enemy-charger.png" -Force
New-Item -ItemType File -Path "assets/images/enemy-tank.png" -Force
New-Item -ItemType File -Path "assets/images/enemy-shooter.png" -Force

Write-Host "All placeholder files created successfully!" 