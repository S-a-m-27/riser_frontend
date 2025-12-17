# Sound Files for RISER App

This directory should contain the following sound files for the RISER application:

## Required Sound Files

1. **quiz_success.mp3** - Played when user passes a quiz (score >= 70%)
2. **quiz_fail.mp3** - Played when user fails a quiz (score < 70%)
3. **button_click.mp3** - Played when user clicks buttons (quiet, frequent)
4. **level_up.mp3** - Played when user completes a level or achieves a milestone
5. **achievement.mp3** - Played when user unlocks an achievement

## File Requirements

- **Format**: MP3 (recommended) or WAV
- **Duration**: 0.5 - 2 seconds (short, non-intrusive)
- **Volume**: Normalized to avoid sudden loud sounds
- **Quality**: 44.1kHz, 128kbps or higher

## Where to Get Sounds

You can find free sound effects at:
- [Freesound.org](https://freesound.org) - Free, CC0 licensed sounds
- [Zapsplat](https://www.zapsplat.com) - Free with account
- [Mixkit](https://mixkit.co/free-sound-effects/) - Free sound effects
- [OpenGameArt](https://opengameart.org) - Free game sounds

## Search Terms

- Success: "success", "correct", "ding", "chime", "achievement"
- Fail: "fail", "error", "wrong", "buzz"
- Click: "click", "tap", "button", "ui click"
- Level Up: "level up", "power up", "fanfare", "victory"
- Achievement: "achievement", "unlock", "trophy", "celebration"

## Testing

After adding sound files:
1. Check browser console for sound loading messages
2. Test button clicks to hear click sounds
3. Complete a quiz to test success/fail sounds
4. Check that sounds play at appropriate volume

## Troubleshooting

If sounds don't play:
1. Check browser console for error messages
2. Verify file names match exactly (case-sensitive)
3. Ensure files are in `public/sounds/` directory
4. Check browser autoplay policies (user interaction may be required)
5. Verify Howler.js is installed: `npm install howler`
