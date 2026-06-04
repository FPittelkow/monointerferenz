---
layout: post
title: Emergence Machine
categories: Computational
# date: 2026-05-05 Europe/Brussel
short_description: Ia Raspberry Pi–based environmental observation and interpretation system.
featured: false
# image_preview: /assets/images/thumbnails/connected-ideas.png
---
## Overview

Emergence Machine is a Raspberry Pi–based environmental observation and interpretation system.

The system continuously observes its surroundings through cameras, microphones, and physical sensors. Rather than directly generating sound or visuals, it extracts features from these inputs, derives higher-level system states, and transmits those states via OSC to external systems such as Max/MSP.

The project is inspired by concepts of emergence, cybernetics, systems theory, and environmental computation. The goal is not measurement but the generation of behaviors that arise through the interaction of multiple independent subsystems.

---

## Core Architecture

```text
Sensors
(Camera, Audio, GPIO, I²C)
          │
          ▼
     Raw State
          │
          ▼
   Emergence Engine
          │
          ▼
   Derived State
          │
    ┌─────┴─────┐
    ▼           ▼
  OSC       Web UI
    │
    ▼
 Max/MSP
```

---

## System Responsibilities

### Raspberry Pi

The Raspberry Pi acts as:

- observer
- feature extractor
- state machine
- OSC transmitter
- local web server

The Pi does not perform heavy audio synthesis or visual rendering.

### Max/MSP

Max/MSP acts as:

- sound engine
- visual engine
- recording system
- performance environment

It receives interpreted state variables rather than raw sensor streams.

---

## Technology Stack

### Platform

- Raspberry Pi 4
- Debian 13 (Trixie)

### Python

- Python 3
- uv
- asyncio

### Input

- OpenCV / Picamera2
- sounddevice
- gpiozero
- smbus2

### Communication

- python-osc
- FastAPI
- WebSockets

### Output

- OSC
- Browser Dashboard
- Max/MSP

---

## Repository Structure

```text
emergence-machine/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── camera.py
│   ├── audio.py
│   ├── sensors.py
│   ├── osc.py
│   ├── state.py
│   └── engine.py
│
├── static/
│   ├── index.html
│   ├── sketch.js
│   └── style.css
│
├── data/
├── logs/
│
├── pyproject.toml
├── uv.lock
└── README.md
```

---

## State Architecture

All modules communicate exclusively through a shared state object.

Modules should never directly call each other.

```text
camera.py
audio.py
sensors.py
      │
      ▼
   state.py
      │
      ▼
   engine.py
      │
      ▼
    osc.py
```

This keeps the system modular and allows sensors, engines, and outputs to be replaced independently.

---

## Raw State

Raw state contains direct measurements.

Examples:

```python
motion
brightness
audio_energy
audio_centroid
temperature
humidity
light_level
```

Raw state should remain close to the physical world.

---

## Engine State

Engine state contains interpreted variables.

Examples:

```python
complexity
coherence
tension
growth
entropy
stability
```

These are the primary outputs of the system.

Max/MSP should primarily consume these values.

---

## OSC Design

Examples:

```text
/emergence/raw/motion
/emergence/raw/brightness
/emergence/raw/audio_energy

/emergence/engine/complexity
/emergence/engine/coherence
/emergence/engine/tension
/emergence/engine/entropy
```

OSC update frequency:

```text
20 Hz
```

is sufficient for most uses.

---

## Development Roadmap

### Phase 1

Communication Backbone

- OSC transmission
- Shared state
- Simulated sensor data
- Max/MSP connectivity

Status:

- OSC working

### Phase 2

Real Sensors

- Camera
- Microphone
- GPIO sensors

### Phase 3

Emergence Engine

- State derivation
- Temporal memory
- Feedback loops
- Environmental interpretation

### Phase 4

Dashboard

- FastAPI
- WebSocket streaming
- Live visualization

### Phase 5

Installation Mode

- Autostart via systemd
- Headless operation
- Long-term logging
- Exhibition deployment

---

## Design Principles

1. Sensors observe.
2. The engine interprets.
3. OSC communicates.
4. Max/MSP performs.

Keep sensing, interpretation, and rendering separate.

The system should not map sensor values directly to outputs. Instead, behaviors should emerge from interactions between multiple variables and temporal processes.

The machine is not a measurement device but an environmental observer whose internal states evolve over time.
