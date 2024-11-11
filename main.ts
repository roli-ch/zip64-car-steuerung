//  Programm name:    zip64-car-steuerung
//  Car Steuerung Sender mit Rotation
//  V1 von car-steuerung-py kopiert   11.11.2024
//  LED Anzeigen:
//  Remote    0,0
//  Speed     2,0 - 2,4
//  richtung  0,2 - 0,4
//  licht     4,4
//  on        4,0
//  Buttons
//  =====================================
//  A: on/off, on: LED 4,0
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    if (fahren == 0) {
        fahren = 1
        set_led_fahren(1)
        // led.plot(0, 0)
        music.play(music.tonePlayable(262, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
    } else {
        fahren = 0
        speed = 0
        richtung = 0
        trigger = 1
        send_data()
        set_led_fahren(0)
        //  led.unplot(0, 0)
        music.play(music.createSoundExpression(WaveShape.Square, 1600, 1, 255, 0, 1000, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.UntilDone)
    }
    
    radio.sendValue("fahren", fahren)
})
//  B: Licht on/off, on: LED xy44
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    
    if (licht_on == 0) {
        licht_on = 1
        set_led_licht(1)
    } else {
        //  led.plot(4, 0)
        licht_on = 0
        send_data()
        set_led_licht(0)
    }
    
    // led.unplot(4, 0)
    radio.sendValue("licht_on", licht_on)
    display.clear()
    display.show()
})
GAME_ZIP64.onButtonPress(GAME_ZIP64.ZIP64ButtonPins.Fire2, GAME_ZIP64.ZIP64ButtonEvents.Click, function on_fire2() {
    
    serial.writeValue("fire ", 2)
    trigger = 1
    speed = 0
    richtung = 0
    send_data()
})
//  Funktionen
//  ===================================
//  Leds ein/aus
//  -------------------
//  remotControl
function set_led_remote(on: number) {
    let pos = [0, 0]
    if (on) {
        led.plot(pos[0], pos[1])
    } else {
        led.unplot(pos[0], pos[1])
    }
    
}

//  fahren
function set_led_fahren(on: number) {
    let pos = [4, 0]
    if (on) {
        led.plot(pos[0], pos[1])
    } else {
        led.unplot(pos[0], pos[1])
    }
    
}

//  stop
function set_led_stop(on: number) {
    let pos = [2, 2]
    if (on) {
        led.plot(pos[0], pos[1])
    } else {
        led.unplot(pos[0], pos[1])
    }
    
}

//  licht
function set_led_licht(on: number) {
    let pos = [4, 4]
    if (on) {
        led.plot(pos[0], pos[1])
    } else {
        led.unplot(pos[0], pos[1])
    }
    
}

//  Daten Senden
function send_data() {
    
    if (trigger == 1) {
        serial.writeValue("speedx", speed)
        serial.writeValue("richtungx", richtung)
        radio.sendNumber(1)
        radio.setTransmitSerialNumber(true)
        radio.sendValue("speed", speed)
        radio.sendValue("richtung", richtung)
        radio.sendValue("licht_on", licht_on)
        trigger = 0
    }
    
}

// pause(100)
//  Daten Empfangen
// led.unplot(4, 0)
radio.onReceivedValue(function on_received_value(name: string, value: number) {
    
    music.play(music.tonePlayable(Note.C, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
    serial.writeValue("daten empfangen: " + name, value)
    if (name == "remCtrl") {
        remCtrl = value
    }
    
    if (remCtrl) {
        set_led_remote(1)
    } else {
        // led.plot(4, 0)
        set_led_remote(0)
    }
    
})
function setSpeed() {
    
    if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Up)) {
        trigger = 1
        if (speed < 100) {
            speed += 1
        }
        
    }
    
    if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Down)) {
        trigger = 1
        if (speed > -100) {
            speed -= 1
        }
        
    }
    
}

// pause(10)
function setRichtung() {
    
    if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Right)) {
        trigger = 1
        if (richtung < 100) {
            richtung += 1
        }
        
    }
    
    if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Left)) {
        trigger = 1
        if (richtung > -100) {
            richtung -= 1
        }
        
    }
    
}

// pause(10)
function showSpeed() {
    if (speed > 0) {
        if (speed > s2) {
            led.plot(2, 0)
            led.plot(2, 1)
            led.plot(2, 2)
        } else {
            led.unplot(2, 0)
            led.plot(2, 1)
        }
        
    } else if (speed < 0) {
        if (speed < -1 * s2) {
            led.plot(2, 2)
            led.plot(2, 3)
            led.plot(2, 4)
        } else {
            led.plot(2, 3)
            led.unplot(2, 4)
        }
        
    } else if (speed == 0) {
        led.unplot(2, 0)
        led.unplot(2, 1)
        led.plot(2, 2)
        led.unplot(2, 3)
        led.unplot(2, 4)
    }
    
}

function showRichtung() {
    if (richtung > 0) {
        if (richtung > r2) {
            led.plot(2, 2)
            led.plot(3, 2)
            led.plot(4, 2)
        } else {
            led.unplot(4, 2)
            led.plot(3, 2)
        }
        
    } else if (richtung < 0) {
        if (richtung < -1 * r2) {
            led.plot(0, 2)
            led.plot(1, 2)
            led.plot(2, 2)
        } else {
            led.plot(1, 2)
            led.unplot(0, 2)
        }
        
    } else if (richtung == 0) {
        led.unplot(0, 2)
        led.unplot(1, 2)
        led.plot(2, 2)
        led.unplot(3, 2)
        led.unplot(4, 2)
    }
    
}

//  Init
//  =========================
let richtung = 0
let licht_on = 0
// speedRoh = 0
// speedOld = 0
// speedAbs = 0
// speedFaktor = 2
let remCtrl = 0
let speed = 0
let fahren = 0
let trigger = 0
let hyst = 5
let s0 = 10
let s2 = 80
let r0 = 10
let r2 = 80
basic.showLeds(`
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    `)
basic.pause(1000)
basic.clearScreen()
let display = GAME_ZIP64.createZIP64Display()
display.clear()
display.show()
//  Time Loop 1s
//  =====================================
loops.everyInterval(100, function on_every_interval() {
    
    if (trigger == 1) {
        datalogger.log(datalogger.createCV("speed", speed), datalogger.createCV("trigger", trigger), datalogger.createCV("richtung", richtung))
        trigger = 0
    }
    
})
//  Main Loop
//  =====================================
basic.forever(function on_forever() {
    
    if (fahren == 1) {
        set_led_fahren(1)
        setSpeed()
        showSpeed()
        setRichtung()
        showRichtung()
        send_data()
    } else {
        showSpeed()
        showRichtung()
        set_led_stop(1)
        trigger = 1
    }
    
})
