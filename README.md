# Fruit Catcher Game

A hand-gesture controlled fruit catching game built with p5.js and ml5.js.

## Requirements

The game requires the following libraries:
- p5.js (main library)
- p5.sound (for audio capabilities)
- ml5.js (for hand tracking)

## Sound Files

Make sure the following sound files are available in the `assets/sound/` directory:
- bg.mp3 - Background menu music
- game.mp3 - Game music
- fruitdrop.mp3 - Sound when a fruit is dropped
- fruitgrab.mp3 - Sound when a fruit is grabbed
- fruitinbasket.mp3 - Sound when a fruit is placed in the basket
- button.mp3 - Button click sound
- pause.mp3 - Pause sound
- gameover.mp3 - Game over sound
- win.mp3 - Game win sound

## Known Issues

If you encounter issues with sound not loading, make sure:
1. Your browser allows autoplay of audio
2. The p5.sound library is properly loaded
3. All sound files exist in the correct location

## Controls

- Use your hand to grab fruits (close your hand to grab)
- Open your hand over the basket to drop the fruit
- Click on buttons to navigate through menus

## Features

- Hand gesture control
- Different difficulty levels
- Sound volume controls
- High score leaderboard

## Authors

t2ne - cyzuko

<!-- Falta:
- Fix dos textos e cenas do género para ficar mais bonito
- Mudar o 120s para minutos e segundos
- Habilitar o jogador para jogar com 2 mãos ou mais pra multiplayer
- Criar pauseMenu (ESC no jogo) e usar o som (maybe meter tmb por voz)
- Pause Menu tenha opção de dar resume e sair do jogo
- Usar assets para a fruta e para o basket
- Melhorar detetaçãa das frutas e aumentar hitbox
- Meter menos speed no dificil porque buga de vez em quando
- ...
 -->