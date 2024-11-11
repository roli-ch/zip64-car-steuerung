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
        sendData()
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
        sendData()
        set_led_licht(0)
    }
    
    // led.unplot(4, 0)
    radio.sendValue("licht_on", licht_on)
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
function sendData() {
    
    if (trigger == 1) {
        // serial.write_value("speed", speed)
        // serial.write_value("richtung", richtung)
        radio.sendNumber(1)
        radio.setTransmitSerialNumber(true)
        radio.sendValue("speed", speed)
        radio.sendValue("richtung", richtung)
        radio.sendValue("licht_on", licht_on)
        trigger = 0
    }
    
}

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
    let speedDir: number;
    
    speedRoh = input.rotation(Rotation.Pitch) * -1
    if (speedRoh > 0) {
        speedDir = 1
    } else {
        speedDir = -1
    }
    
    // speed = Math.constrain(abs(speedRoh) - s0, 0, 100)
    // speed = min(100, speed / 2 * 10) * speedDir
    speed = Math.min(100, Math.abs(speedRoh * speedFaktor)) * speedDir
    speedAbs = Math.abs(speed)
    if (Math.abs(speedAbs - speedOld) > hyst) {
        trigger = 1
        // serial.write_value("speedAbs", speedAbs)
        // serial.write_value("speedOld", speedOld)
        speedOld = speedAbs
    }
    
}

function setRichtung() {
    let richtungDir: number;
    
    richtungRoh = input.rotation(Rotation.Roll)
    if (richtungRoh > 0) {
        richtungDir = 1
    } else {
        richtungDir = -1
    }
    
    // richtung = Math.constrain(abs(richtungRoh) - r0, 0, 100)
    // richtung = min(100, richtung / 2 * 10) * richtungDir
    richtung = Math.min(100, Math.abs(richtungRoh * richtungFkt)) * richtungDir
    richtungAbs = Math.abs(richtung)
    if (Math.abs(richtungAbs - richtungOld) > hyst) {
        trigger = 1
        richtungOld = richtungAbs
    }
    
}

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
let richtungRoh = 0
let richtungOld = 0
let richtungAbs = 0
let richtungFkt = 2
// richtungDir = 0
let richtung = 0
let licht_on = 0
let speedRoh = 0
let speedOld = 0
let speedAbs = 0
let speedFaktor = 2
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
//  Time Loop 1s
//  =====================================
loops.everyInterval(100, function on_every_interval() {
    
    if (trigger == 1) {
        datalogger.log(datalogger.createCV("speedRoh", speedRoh), datalogger.createCV("speed", speed), datalogger.createCV("speedAbs", speedAbs), datalogger.createCV("speedOld", speedOld), datalogger.createCV("trigger", trigger), datalogger.createCV("richtung", richtung), datalogger.createCV("richtungRoh", richtungRoh))
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
        sendData()
    } else {
        showSpeed()
        showRichtung()
        set_led_stop(1)
    }
    
})
