# Programm name:    zip64-car-steuerung
# Car Steuerung Sender mit Rotation
# V1 von car-steuerung-py kopiert   11.11.2024

# LED Anzeigen:
# Remote    0,0
# Speed     2,0 - 2,4
# richtung  0,2 - 0,4
# licht     4,4
# on        4,0

# Buttons
# =====================================

# A: on/off, on: LED 4,0
def on_button_pressed_a():
    global fahren, speed, richtung, trigger
    if fahren == 0:
        fahren = 1
        set_led_fahren(1)
        #led.plot(0, 0)
        music.play(music.tone_playable(262, music.beat(BeatFraction.WHOLE)),
            music.PlaybackMode.UNTIL_DONE)
    else:
        fahren = 0
        speed = 0
        richtung = 0
        trigger = 1
        send_data()
        set_led_fahren(0)
        # led.unplot(0, 0)
        music.play(music.create_sound_expression(WaveShape.SQUARE,
                1600,
                1,
                255,
                0,
                1000,
                SoundExpressionEffect.NONE,
                InterpolationCurve.CURVE),
            music.PlaybackMode.UNTIL_DONE)
    radio.send_value("fahren", fahren)
input.on_button_pressed(Button.A, on_button_pressed_a)

# B: Licht on/off, on: LED xy44
def on_button_pressed_b():
    global licht_on
    if licht_on == 0:
        licht_on = 1
        set_led_licht(1)
        # led.plot(4, 0)
    else:
        licht_on = 0
        send_data()
        set_led_licht(0)
        #led.unplot(4, 0)
    radio.send_value("licht_on", licht_on)
    display.clear()
    display.show()
input.on_button_pressed(Button.B, on_button_pressed_b)

def on_fire2():
    global trigger, speed, richtung
    serial.write_value("fire ", 2)
    trigger = 1
    speed = 0
    richtung = 0
    send_data()
GAME_ZIP64.on_button_press(GAME_ZIP64.ZIP64ButtonPins.FIRE2,GAME_ZIP64.ZIP64ButtonEvents.CLICK,on_fire2)

# Funktionen
# ===================================

# Leds ein/aus
# -------------------
# remotControl
def set_led_remote(on):
    pos = (0,0)
    if on:
        led.plot(pos[0],pos[1])
    else:
        led.unplot(pos[0],pos[1])

# fahren
def set_led_fahren(on):
    pos = (4,0)
    if on:
        led.plot(pos[0],pos[1])
    else:
        led.unplot(pos[0],pos[1])

# stop
def set_led_stop(on):
    pos = (2,2)
    if on:
        led.plot(pos[0],pos[1])
    else:
        led.unplot(pos[0],pos[1])

# licht
def set_led_licht(on):
    pos = (4,4)
    if on:
        led.plot(pos[0],pos[1])
    else:
        led.unplot(pos[0],pos[1])


# Daten Senden
def send_data():
    global trigger, speed, richtung, licht_on
    if trigger == 1:
        serial.write_value("speedx", speed)
        serial.write_value("richtungx", richtung)
        radio.send_number(1)
        radio.set_transmit_serial_number(True)
        radio.send_value("speed", speed)
        radio.send_value("richtung", richtung)
        radio.send_value("licht_on", licht_on)
        trigger = 0
        #pause(100)
        
# Daten Empfangen
def on_received_value(name, value):
    global remCtrl
    music.play(music.tone_playable(Note.C, music.beat(BeatFraction.WHOLE)), music.PlaybackMode.UNTIL_DONE)
    serial.write_value("daten empfangen: "+name, value)
    if name == "remCtrl":
        remCtrl = value
    if remCtrl:
        set_led_remote(1)
        #led.plot(4, 0)
    else:
        set_led_remote(0)
        #led.unplot(4, 0)
radio.on_received_value(on_received_value)

def setSpeed():
    global speed, trigger
    if GAME_ZIP64.button_is_pressed(GAME_ZIP64.ZIP64ButtonPins.UP):
        trigger = 1
        if speed < 100:
            speed += 1
    if GAME_ZIP64.button_is_pressed(GAME_ZIP64.ZIP64ButtonPins.DOWN):
        trigger = 1
        
        if speed >-100:
            speed -= 1
    #pause(10)
    
def setRichtung():
    global richtung, trigger
    if GAME_ZIP64.button_is_pressed(GAME_ZIP64.ZIP64ButtonPins.Right):
        trigger = 1
        if richtung < 100:
            richtung += 1
    if GAME_ZIP64.button_is_pressed(GAME_ZIP64.ZIP64ButtonPins.LEFT):
        trigger = 1
        if richtung >-100:
            richtung -= 1
    #pause(10)

def showSpeed():
    if speed > 0:
        if speed > s2:
            led.plot(2, 0)
            led.plot(2, 1)
            led.plot(2, 2)
        else:
            led.unplot(2, 0)
            led.plot(2, 1)
    elif speed < 0:
        if speed < -1 * s2:
            led.plot(2, 2)
            led.plot(2, 3)
            led.plot(2, 4)
        else:
            led.plot(2, 3)
            led.unplot(2, 4)
    elif speed == 0:
        led.unplot(2, 0)
        led.unplot(2, 1)
        led.plot(2, 2)
        led.unplot(2, 3)
        led.unplot(2, 4)

def showRichtung():
    if richtung > 0:
        if richtung > r2:
            led.plot(2, 2)
            led.plot(3, 2)
            led.plot(4, 2)
        else:
            led.unplot(4, 2)
            led.plot(3, 2)
    elif richtung < 0:
        if richtung < -1 * r2:
            led.plot(0, 2)
            led.plot(1, 2)
            led.plot(2, 2)
        else:
            led.plot(1, 2)
            led.unplot(0, 2)
    elif richtung == 0:
        led.unplot(0, 2)
        led.unplot(1, 2)
        led.plot(2, 2)
        led.unplot(3, 2)
        led.unplot(4, 2)

# Init
# =========================

richtung = 0
licht_on = 0
#speedRoh = 0
#speedOld = 0
#speedAbs = 0
#speedFaktor = 2
remCtrl = 0
speed = 0
fahren = 0
trigger = 0
hyst = 5
s0 = 10
s2 = 80
r0 = 10
r2 = 80
basic.show_leds("""
    . . . . .
    . # # # .
    . # . # .
    . # # # .
    . . . . .
    """)
basic.pause(1000)
basic.clear_screen()
display = GAME_ZIP64.create_zip64_display()
display.clear()
display.show()

# Time Loop 1s
# =====================================

def on_every_interval():
    global trigger
    if trigger == 1:
        datalogger.log(datalogger.create_cv("speed", speed),
            datalogger.create_cv("trigger", trigger),
            datalogger.create_cv("richtung", richtung))
        trigger = 0
loops.every_interval(100, on_every_interval)

# Main Loop
# =====================================
def on_forever():
    global trigger
    if fahren == 1:
        set_led_fahren(1)
        setSpeed()
        showSpeed()
        setRichtung()
        showRichtung()
        send_data()
    else:
        showSpeed()
        showRichtung()
        set_led_stop(1)
        trigger = 1
        
        
basic.forever(on_forever)