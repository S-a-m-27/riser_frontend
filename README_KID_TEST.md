# RISER Kid-Friendly UI Testing Guide

## Quick Test Tasks (8 Tasks)

### 1. Age Gate Flow ✅
**What to test:**
- Navigate to `/age-gate`
- Select an age (try both under 13 and 13+)
- For under 13: Verify parental consent modal appears
- For 13+: Should proceed directly to signup
- Test year selector as alternative input method

**What to observe:**
- [ ] Age selection is clear and easy
- [ ] Parental consent modal explains why consent is needed
- [ ] Privacy banner appears for minors
- [ ] Navigation flow is smooth

---

### 2. Parental Consent Modal ✅
**What to test:**
- Trigger modal by selecting age < 13
- Click "I'm a Parent" button
- Fill in parent email (and optional phone)
- Click "Send Consent Request"
- Verify mock success message appears

**What to observe:**
- [ ] Steps are clearly explained
- [ ] Form is accessible (labels, focus states)
- [ ] Mock flow indicates what would happen in real app
- [ ] User can proceed after "consent given" (mocked)

---

### 3. Signup & Avatar Selection ✅
**What to test:**
- Complete signup form
- Navigate to avatar selection
- Click different avatars
- Verify confetti and sound on selection
- Click "Continue" and verify confetti burst

**What to observe:**
- [ ] Avatar cards are large enough (44px minimum)
- [ ] Selection feedback is clear (checkmark, glow)
- [ ] Confetti animation plays (if enabled)
- [ ] Sound plays (if enabled)
- [ ] Animations are smooth but not overwhelming

---

### 4. Quiz Experience ✅
**What to test:**
- Start a quiz
- Answer questions (both correct and incorrect)
- Verify sound plays on correct answer
- Complete quiz and view results
- Verify confetti on good score (70%+)

**What to observe:**
- [ ] Questions are readable (large font)
- [ ] Answer buttons are large touch targets
- [ ] Feedback is encouraging ("You got this!", "Try again!")
- [ ] Correct answer sound plays
- [ ] Confetti triggers on success
- [ ] Progress bar is clear

---

### 5. Puzzle Task Completion ✅
**What to test:**
- Start puzzle task
- Drag and drop items
- Complete the task
- Verify completion animation/confetti

**What to observe:**
- [ ] Drag and drop is intuitive
- [ ] Drop zones are clearly indicated
- [ ] Completion triggers celebration
- [ ] Colors are bright and friendly

---

### 6. Help Bubble ✅
**What to test:**
- Look for floating help button (bottom right)
- Click help button
- Verify tips panel opens
- Read through tips
- Close panel

**What to observe:**
- [ ] Help button is always visible
- [ ] Button is large enough (44px)
- [ ] Tips are helpful and friendly
- [ ] Panel is accessible (keyboard navigation, focus)

---

### 7. Parental Controls Settings ✅
**What to test:**
- Navigate to `/settings/parental-controls`
- Toggle various settings:
  - Multiplayer Chat
  - Restrict Difficulty
  - Daily Time Limit (slider)
  - Enable Sounds
  - Enable Confetti
  - Reduce Motion
- Click "Save Settings"
- Verify settings persist (check localStorage)

**What to observe:**
- [ ] All toggles are clear and accessible
- [ ] Slider for time limit works smoothly
- [ ] Settings save (mocked to localStorage)
- [ ] Mock notice explains backend requirement

---

### 8. Accessibility & Responsiveness ✅
**What to test:**
- Navigate entire app using only keyboard (Tab, Enter, Space)
- Test with screen reader (if available)
- Check color contrast (use browser dev tools)
- Test on mobile device (or responsive mode)
- Toggle "Reduce Motion" setting

**What to observe:**
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets AA standards
- [ ] Touch targets are minimum 44px
- [ ] Text is readable on mobile
- [ ] Reduced motion setting works

---

## Observability Checklist

### Visual Design
- [ ] Colors are bright and saturated (blues, teals, yellows)
- [ ] Rounded corners throughout (rounded-2xl)
- [ ] Large, readable fonts (base 1.125rem)
- [ ] Friendly icons and emojis used appropriately
- [ ] Shadows are soft, not harsh
- [ ] Animations are gentle and playful

### User Experience
- [ ] Text is simple and age-appropriate
- [ ] Instructions are step-by-step (1-2 sentences)
- [ ] Error messages are friendly ("Oops! Try again!")
- [ ] Success messages are encouraging ("Great job! 🎉")
- [ ] Navigation is clear and intuitive
- [ ] No overwhelming information on any screen

### Gamification
- [ ] Confetti triggers on key successes:
  - [ ] Avatar selection confirmation
  - [ ] Quiz completion (good score)
  - [ ] Puzzle completion
  - [ ] Simulation completion
- [ ] Sounds play appropriately:
  - [ ] Correct quiz answer
  - [ ] Task completion
- [ ] Badges/achievements are visible (placeholders)
- [ ] Progress indicators are clear

### Safety & Privacy
- [ ] Age gate appears before signup
- [ ] Parental consent required for < 13
- [ ] Privacy banner shown for minors
- [ ] Parental controls page exists
- [ ] Settings can restrict content
- [ ] Mock notices explain what needs backend

### Performance
- [ ] Animations don't lag
- [ ] Sounds load quickly (if enabled)
- [ ] Confetti doesn't impact performance
- [ ] Images are optimized
- [ ] No layout shifts during load

### Technical
- [ ] No console errors
- [ ] All routes work
- [ ] Zustand state persists correctly
- [ ] Mocked features are clearly marked
- [ ] Comments explain backend requirements

---

## Notes for Playtesting with Kids (Ages 12-16)

1. **Watch for confusion:**
   - Do they understand what to do?
   - Are instructions clear?
   - Do they get stuck anywhere?

2. **Observe engagement:**
   - Do they enjoy the animations?
   - Are sounds helpful or distracting?
   - Do they read the help tips?

3. **Check accessibility:**
   - Can they use it on their device?
   - Are buttons big enough?
   - Is text readable?

4. **Safety awareness:**
   - Do they understand parental consent?
   - Do they notice privacy information?
   - Are they comfortable with the age gate?

5. **Feedback collection:**
   - What do they like?
   - What's confusing?
   - What would make it more fun?

---

## Known Limitations (Mocked Features)

These features are UI-only and need backend implementation:

1. **Age Gate:**
   - Age stored in Zustand only (not persisted to backend)
   - No age verification

2. **Parental Consent:**
   - No actual email/SMS sending
   - No parent verification
   - Consent is mocked (can proceed immediately)

3. **Parental Controls:**
   - Settings saved to localStorage only
   - No server-side enforcement
   - No parent account linking

4. **Sounds:**
   - Sound files need to be added to `public/sounds/`:
     - `correct.wav`
     - `success.wav`

5. **Confetti:**
   - Currently always enabled (should respect settings)

---

## Next Steps for Backend Integration

1. Create API endpoints for:
   - Age verification
   - Parental consent verification
   - Parental controls persistence
   - User settings storage

2. Implement:
   - Email/SMS verification for parents
   - COPPA compliance checks
   - Parent account management
   - Settings enforcement server-side

3. Add:
   - Sound file assets
   - Analytics for engagement
   - Error logging
   - Performance monitoring

---

## Quick Commands

```bash
# Run the app
npm run dev

# Check for linting errors
npm run lint

# Build for production
npm run build
```

---

**Last Updated:** December 2024
**Version:** 1.0.0 (Kid-Friendly UI Implementation)



