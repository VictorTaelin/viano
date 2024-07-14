// VIANO: The VIM Piano
//
// How it works:
// - The screen shows a Circle of Fifths.
// - One chord is *focused* (ex: C Major).
//
// Left Hand:
// - The top row (QWER) plays the prev chord (ex: F Major / subdominant).
// - The mid row (ASDF) plays the main chord (ex: C Major / tonic).
// - The bot row (ZXCV) plays the next chord (ex: G Major / dominant).
// - When space is pressed down, the respective minor chord is played instead.
// - Pressing left/right on the keyboard rotates the focused chord.
// - Pressing up/down on the keyboard increases/decreases the octave of left hand chords.
//
// Right Hand:
// - The mid row (GHJ...) has the major scale, starting from B
// - The top row (TYU...) has the major scale, one octave lower
// - The bot row (BNM...) has the major scale, one octave higher
// - Ex: [G] [H] [J] [K] [L] [;] ['] [enter] map to B5 C5 D5 E5 F5 G5 A6 B6
//
// This allows for an easy style of playing the piano on notebooks, where the
// right hand performs the chords and the left hand performs the melody.

const chords = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
const minorChords = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'];
let currentChordIndex = 0;
let isMinor = false;
let leftHandOctave = 0; // New variable to track left hand octave

// Initialize Tone.js
const synth = new Tone.Sampler({
  urls: {
    A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
    A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
    A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
    A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
    A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
    A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
    A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
    A7: "A7.mp3"
  },
  release: 6, // Increase release time to 3 seconds
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

// Update reverb effect
const reverb = new Tone.Reverb({
  decay: 6, // Increase decay time to 5 seconds
  wet: 0.8, // Increase wet signal for more pronounced reverb
}).toDestination();

synth.connect(reverb);

function createCircleOfFifths() {
  const container = document.getElementById('circle-of-fifths');
  container.style.backgroundColor = 'white';
  container.style.zIndex = '2';
  container.style.position = 'relative';
  container.style.borderRadius = '50%';
  container.style.width = '400px';
  container.style.height = '400px';
  chords.forEach((chord, index) => {
    const chordElement = document.createElement('div');
    chordElement.className = 'chord';
    chordElement.innerHTML = `<span class="major">${chord}</span><span class="minor">${minorChords[index]}</span>`;
    const angle = (index * 30 - 90) * (Math.PI / 180);
    const radius = 170;
    chordElement.style.position = 'absolute';
    chordElement.style.left = `${200 + radius * Math.cos(angle) - 30}px`;
    chordElement.style.top = `${200 + radius * Math.sin(angle) - 30}px`;
    container.appendChild(chordElement);
  });
  updateHighlight();
}

function updateHighlight() {
  document.querySelectorAll('.chord').forEach((el, index) => {
    if (index === currentChordIndex) {
      el.style.backgroundColor = '#000';
      el.style.color = '#fff';
      el.style.borderRadius = '50%';
      el.style.margin = '0';
      el.querySelector('.major').style.color = '#fff';
      el.querySelector('.minor').style.color = '#fff';
    } else {
      el.style.backgroundColor = 'transparent';
      el.style.color = '#000';
      el.style.padding = '0';
      el.querySelector('.major').style.color = '#000';
      el.querySelector('.minor').style.color = '#000';
    }
    el.querySelector('.major').style.fontWeight = isMinor ? 'normal' : 'bold';
    el.querySelector('.minor').style.fontWeight = isMinor ? 'bold' : 'normal';
  });
}

// New function to update color circle for active chord
function updateColorCircle(isMinor) {
  //let chordIndex = currentChordIndex;
  //const activeLeftHandKeys = Object.keys(activeNotes).filter(k => ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'].includes(k));
  
  //if (activeLeftHandKeys.length > 0) {
    //if (['q', 'w', 'e', 'r'].some(k => activeLeftHandKeys.includes(k))) {
      //chordIndex = (currentChordIndex - 1 + 12) % 12;
    //} else if (['z', 'x', 'c', 'v'].some(k => activeLeftHandKeys.includes(k))) {
      //chordIndex = (currentChordIndex + 1) % 12;
    //}
  //}

  // TODO: update teh logic above to use the global activeKeys obj instead

  let chordIndex = currentChordIndex;
  const activeLeftHandKeys = Object.keys(activeKeys).filter(k => ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'].includes(k));
  
  if (activeLeftHandKeys.length > 0) {
    if (['q', 'w', 'e', 'r'].some(k => activeLeftHandKeys.includes(k))) {
      chordIndex = (currentChordIndex - 1 + 12) % 12;
    } else if (['z', 'x', 'c', 'v'].some(k => activeLeftHandKeys.includes(k))) {
      chordIndex = (currentChordIndex + 1) % 12;
    }
  }

  let colorCircle = document.getElementById('color-circle');
  if (!colorCircle) {
    colorCircle = document.createElement('div');
    colorCircle.id = 'color-circle';
    colorCircle.style.position = 'absolute';
    colorCircle.style.width = '40px';
    colorCircle.style.height = '40px';
    colorCircle.style.borderRadius = '50%';
    colorCircle.style.zIndex = '3';
    colorCircle.style.border = '3px solid transparent';
    colorCircle.style.boxSizing = 'border-box';
    document.getElementById('circle-of-fifths').appendChild(colorCircle);
  }

  colorCircle.style.display = 'block';
  colorCircle.style.borderColor = isMinor ? '#ff9999' : '#a3d8f4';
  colorCircle.style.backgroundColor = 'transparent';
  
  const container = document.getElementById('circle-of-fifths');
  const angle = (chordIndex * 30 - 90) * (Math.PI / 180);
  const radius = 170;
  colorCircle.style.left = `${200 + radius * Math.cos(angle) - 20}px`;
  colorCircle.style.top = `${200 + radius * Math.sin(angle) - 20}px`;
}

function updateColorCircle(isMinor) {
  let chordIndex = currentChordIndex;
  const activeLeftHandKeys = Object.keys(activeNotes).filter(k => ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'].includes(k));
  
  if (activeLeftHandKeys.length > 0) {
    if (['q', 'w', 'e', 'r'].some(k => activeLeftHandKeys.includes(k))) {
      chordIndex = (currentChordIndex - 1 + 12) % 12;
    } else if (['z', 'x', 'c', 'v'].some(k => activeLeftHandKeys.includes(k))) {
      chordIndex = (currentChordIndex + 1) % 12;
    }
  }

  let colorCircle = document.getElementById('color-circle');
  if (!colorCircle) {
    colorCircle = document.createElement('div');
    colorCircle.id = 'color-circle';
    colorCircle.style.position = 'absolute';
    colorCircle.style.width = '60px';
    colorCircle.style.height = '60px';
    colorCircle.style.borderRadius = '50%';
    colorCircle.style.zIndex = '3';
    colorCircle.style.border = '3px solid transparent';
    colorCircle.style.boxSizing = 'border-box';
    document.getElementById('circle-of-fifths').appendChild(colorCircle);
  }

  colorCircle.style.display = 'block';
  colorCircle.style.borderColor = isMinor ? '#ff9999' : '#a3d8f4';
  colorCircle.style.backgroundColor = 'transparent';
  
  const container = document.getElementById('circle-of-fifths');
  const angle = (chordIndex * 30 - 90) * (Math.PI / 180);
  const radius = 170;
  colorCircle.style.left = `${200 + radius * Math.cos(angle) - 30}px`;
  colorCircle.style.top = `${200 + radius * Math.sin(angle) - 30}px`;
}

function rotateChord(direction) {
  currentChordIndex = (currentChordIndex + direction + 12) % 12;
  updateHighlight();
  updateActiveNotes();
  updateKeyboardDisplay();
}

function toggleMinor() {
  isMinor = !isMinor;
  updateHighlight();
  updateActiveNotes();
  updateKeyboardDisplay();
}

function noteToFrequency(midiNote) {
  return Tone.Frequency(midiNote, "midi").toFrequency();
}

function calculateVolume(midiNote) {
  const lowestNote = 45;
  const highestNote = 91;
  const minVolume = 0.1;
  const maxVolume = 0.3;
  const normalizedNote = (midiNote - lowestNote) / (highestNote - lowestNote);
  const volumeAdjustment = Math.pow(1 - normalizedNote, 2);
  return minVolume + (maxVolume - minVolume) * volumeAdjustment;
}

function playNote(midiNote) {
  const freq = Tone.Frequency(midiNote, "midi");
  const volume = calculateVolume(midiNote);
  synth.triggerAttack(freq, Tone.now(), volume);
  return { freq, volume };
}

function stopNote(note) {
  const now = Tone.now();
  synth.triggerRelease(note.freq, now + 0.0); // Add a 2-second delay before release
}

const keyboardMap = {
  // Left hand
  'q': [48, 45], 'w': [53, 50], 'e': [57, 53], 'r': [60, 57],
  'a': [43, 40], 's': [48, 45], 'd': [52, 48], 'f': [55, 52],
  'z': [50, 47], 'x': [55, 52], 'c': [59, 55], 'v': [62, 59],

  // Right hand
  't': [57, 57], 'y': [59, 59], 'u': [60, 60], 'i': [62, 62], 'o': [64, 64], 'p': [65, 65], '[': [67, 67],
  'g': [69, 69], 'h': [71, 71], 'j': [72, 72], 'k': [74, 74], 'l': [76, 76], ';': [77, 77], "'": [79, 79], "\n": [81, 81],
  'b': [81, 81], 'n': [83, 83], 'm': [84, 84], ',': [86, 86], '.': [88, 88], '/': [89, 89], '\\': [91, 91]
};

const activeNotes = {};
const activeKeys = {};

function updateActiveNotes() {
  for (let midiNote = 45; midiNote <= 91; midiNote++) {
    unhighlightPianoKey(midiNote);
    unhighlightKeyboardKey(midiNote);
  }
  Object.entries(activeNotes).forEach(([key, note]) => {
    stopNote(note);
    let midiNote = keyboardMap[key][isMinor ? 1 : 0] + (currentChordIndex * 7) % 12;
    // Apply octave shift for left hand keys
    if (['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'].includes(key)) {
      midiNote += leftHandOctave * 12;
    }
    activeNotes[key] = playNote(midiNote);
    highlightPianoKey(midiNote);
    highlightKeyboardKey(key);
  });
}

const keyCodeToLetter = {
  65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h',
  73: 'i', 74: 'j', 75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p',
  81: 'q', 82: 'r', 83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x',
  89: 'y', 90: 'z', 186: ';', 222: "'", 188: ',', 190: '.', 191: '/',
  219: '[', 221: ']', 220: '\\', 13: '\n',
};

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const key = keyCodeToLetter[event.keyCode] || event.key.toLowerCase();
  activeKeys[key] = true;
  if (key === 'arrowleft') rotateChord(-1);
  else if (key === 'arrowright') rotateChord(1);
  else if (key === 'arrowup') {
    leftHandOctave = Math.min(leftHandOctave + 1, 2);
    updateActiveNotes();
    updateKeyboardDisplay();
  }
  else if (key === 'arrowdown') {
    leftHandOctave = Math.max(leftHandOctave - 1, -2);
    updateActiveNotes();
    updateKeyboardDisplay();
  }
  else if (key === ' ') {
    isMinor = true;
    updateHighlight();
    updateActiveNotes();
    updateKeyboardDisplay();
    updateColorCircle(true);
  }
  else if (key in keyboardMap && !(key in activeNotes)) {
    let midiNote = keyboardMap[key][isMinor ? 1 : 0] + (currentChordIndex * 7) % 12;
    if (['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'].includes(key)) {
      midiNote += leftHandOctave * 12;
      updateColorCircle(isMinor);
    }
    activeNotes[key] = playNote(midiNote);
    highlightPianoKey(midiNote);
    highlightKeyboardKey(key);
  }
  updateColorCircle(isMinor);
});

document.addEventListener('keyup', (event) => {
  const key = keyCodeToLetter[event.keyCode] || event.key.toLowerCase();
  delete activeKeys[key];
  if (key === ' ') {
    isMinor = false;
    updateHighlight();
    updateActiveNotes();
    updateKeyboardDisplay();
    updateColorCircle(false);
  }
  else if (key in activeNotes) {
    let midiNote = keyboardMap[key][isMinor ? 1 : 0] + (currentChordIndex * 7) % 12;
    if (['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'].includes(key)) {
      midiNote += leftHandOctave * 12;
      if (Object.keys(activeNotes).filter(k => ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'].includes(k)).length === 1) {
        const colorCircle = document.getElementById('color-circle');
        if (colorCircle) colorCircle.style.display = 'none';
      }
    }
    stopNote(activeNotes[key]);
    delete activeNotes[key];
    unhighlightPianoKey(midiNote);
    unhighlightKeyboardKey(key);
  }
});

function createPiano() {
  const pianoContainer = document.createElement('div');
  pianoContainer.id = 'piano-container';
  pianoContainer.style.position = 'fixed';
  pianoContainer.style.bottom = '0';
  pianoContainer.style.left = '0';
  pianoContainer.style.width = '100%';
  pianoContainer.style.height = '126px';
  pianoContainer.style.backgroundColor = '#f0f0f0';
  pianoContainer.style.display = 'flex';
  pianoContainer.style.justifyContent = 'center';
  pianoContainer.style.alignItems = 'flex-end';
  pianoContainer.style.overflow = 'hidden';
  pianoContainer.style.zIndex = '1';

  const piano = document.createElement('div');
  piano.id = 'piano';
  piano.style.display = 'flex';
  piano.style.height = '101px';
  piano.style.backgroundColor = '#fff';
  piano.style.border = '1px solid #000';
  piano.style.position = 'relative';

  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const sharps = ['C#', 'D#', 'F#', 'G#', 'A#'];

  for (let octave = 2; octave <= 6; octave++) {
    notes.forEach((note, index) => {
      const key = document.createElement('div');
      key.className = 'piano-key natural';
      key.id = `key-${note}${octave}`;
      key.style.width = '34px';
      key.style.height = '101px';
      key.style.backgroundColor = '#fff';
      key.style.border = '1px solid #000';
      key.style.position = 'relative';
      key.style.zIndex = '0';
      key.innerHTML = `<span style="position: absolute; top: 6px; left: 6px; font-size: 12px;">${note}${octave}</span>`;
      key.style.display = 'flex';
      key.style.justifyContent = 'center';
      key.style.alignItems = 'flex-end';
      key.style.boxSizing = 'border-box';
      piano.appendChild(key);

      if (index > 0 && sharps.includes(notes[index - 1] + '#')) {
        const sharpKey = document.createElement('div');
        sharpKey.className = 'piano-key sharp';
        sharpKey.id = `key-${notes[index - 1]}#${octave}`;
        sharpKey.style.width = '26px';
        sharpKey.style.height = '62px';
        sharpKey.style.backgroundColor = '#000';
        sharpKey.style.position = 'absolute';
        sharpKey.style.left = '-13px';
        sharpKey.style.zIndex = '1';
        sharpKey.innerHTML = `<span style="position: absolute; top: 2px; left: 4px; font-size: 10px; color: #fff;">${notes[index - 1]}#${octave}</span>`;
        sharpKey.style.display = 'flex';
        sharpKey.style.justifyContent = 'center';
        sharpKey.style.alignItems = 'flex-end';
        sharpKey.style.paddingBottom = '6px';
        sharpKey.style.boxSizing = 'border-box';
        key.appendChild(sharpKey);
      }
    });
  }

  pianoContainer.appendChild(piano);
  document.body.appendChild(pianoContainer);
}

function createKeyboardDisplay() {
  const leftKeyboard = document.createElement('div');
  leftKeyboard.id = 'left-keyboard';
  leftKeyboard.style.position = 'fixed';
  leftKeyboard.style.top = '10px';
  leftKeyboard.style.left = '10px';
  leftKeyboard.style.display = 'grid';
  leftKeyboard.style.gridTemplateColumns = 'repeat(4, 40px)';
  leftKeyboard.style.gridGap = '5px';
  leftKeyboard.style.zIndex = '3';

  const rightKeyboard = document.createElement('div');
  rightKeyboard.id = 'right-keyboard';
  rightKeyboard.style.position = 'fixed';
  rightKeyboard.style.top = '10px';
  rightKeyboard.style.right = '10px';
  rightKeyboard.style.display = 'grid';
  rightKeyboard.style.gridTemplateColumns = 'repeat(7, 40px)';
  rightKeyboard.style.gridGap = '5px';
  rightKeyboard.style.zIndex = '3';

  const leftKeys = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V'];
  const rightKeys = ['T', 'Y', 'U', 'I', 'O', 'P', '[', 'G', 'H', 'J', 'K', 'L', ';', "'", 'B', 'N', 'M', ',', '.', '/', '\\'];

  leftKeys.forEach(key => {
    const keyElement = createKeyElement(key.toLowerCase());
    leftKeyboard.appendChild(keyElement);
  });

  rightKeys.forEach(key => {
    const keyElement = createKeyElement(key.toLowerCase());
    rightKeyboard.appendChild(keyElement);
  });

  document.body.appendChild(leftKeyboard);
  document.body.appendChild(rightKeyboard);
}

function createKeyElement(key) {
  const keyElement = document.createElement('div');
  keyElement.className = 'keyboard-key';
  keyElement.id = `keyboard-key-${key}`;
  keyElement.style.width = '40px';
  keyElement.style.height = '40px';
  keyElement.style.backgroundColor = '#fff';
  keyElement.style.border = '1px solid #000';
  keyElement.style.display = 'flex';
  keyElement.style.flexDirection = 'column';
  keyElement.style.justifyContent = 'space-between';
  keyElement.style.alignItems = 'center';
  keyElement.style.padding = '5px';
  keyElement.style.boxSizing = 'border-box';
  keyElement.style.fontSize = '12px';
  keyElement.innerHTML = `
    <span style="font-weight: bold;">${key.toUpperCase()}</span>
    <span style="color: #888;" id="note-${key}"></span>
  `;
  return keyElement;
}

function updateKeyboardDisplay() {
  Object.entries(keyboardMap).forEach(([key, notes]) => {
    const keyElement = document.getElementById(`keyboard-key-${key}`);
    if (keyElement) {
      const noteElement = document.getElementById(`note-${key}`);
      if (noteElement) {
        let midiNote = notes[isMinor ? 1 : 0] + (currentChordIndex * 7) % 12;
        // Apply octave shift for left hand keys
        if (['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'].includes(key)) {
          midiNote += leftHandOctave * 12;
        }
        const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][midiNote % 12];
        const octave = Math.floor(midiNote / 12) - 1;
        noteElement.textContent = `${noteName}${octave}`;
      }
    }
  });
}

function highlightKeyboardKey(key) {
  const keyElement = document.getElementById(`keyboard-key-${key}`);
  if (keyElement) {
    keyElement.style.backgroundColor = '#a3d8f4';
  }
}

function unhighlightKeyboardKey(key) {
  const keyElement = document.getElementById(`keyboard-key-${key}`);
  if (keyElement) {
    keyElement.style.backgroundColor = '#fff';
  }
}

function highlightPianoKey(midiNote) {
  const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][midiNote % 12];
  const octave = Math.floor(midiNote / 12) - 1;
  const key = document.getElementById(`key-${noteName}${octave}`);
  if (key) {
    key.style.backgroundColor = '#a3d8f4';
    key.style.color = '#000';
  }
}

function unhighlightPianoKey(midiNote) {
  const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][midiNote % 12];
  const octave = Math.floor(midiNote / 12) - 1;
  const key = document.getElementById(`key-${noteName}${octave}`);
  if (key) {
    key.style.backgroundColor = key.className.includes('sharp') ? '#000' : '#fff';
    key.style.color = key.className.includes('sharp') ? '#fff' : '#000';
  }
}

createCircleOfFifths();
createPiano();
createKeyboardDisplay();
updateKeyboardDisplay();

// Start audio context on user interaction
document.addEventListener('click', () => {
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }
});
