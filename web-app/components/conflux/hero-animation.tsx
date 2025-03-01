"use client";

import { useEffect, useRef } from "react";

// Define interfaces for the objects used in the animation
interface WireframePoint {
  x: number;
  y: number;
  z: number;
  opacity: number;
}

interface Particle {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  opacity: number;
  yOffset: number;
}

interface AsteroidParticle {
  distance: number;
  baseSize: number;
  size: number;
  opacity: number;
  speed: number;
  offsetX: number;
  offsetY: number;
  curveStrength: number;
  wavePhaseOffset: number;
  waveAmplitudeMultiplier: number;
  irregularity: number;
  spikes: number;
  rotation: number;
  rotationSpeed: number;
  trailLength: number;
  trailOpacity: number;
}

interface Stream {
  angle: number;
  particles: AsteroidParticle[];
  nextParticleTime: number;
  curveX: number;
  curveY: number;
  angleVariation: number;
  waveAmplitude: number;
  waveFrequency: number;
  wavePhase: number;
  particleInterval: number;
}

interface Ring {
  radius: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  segments: number;
  thickness: number;
  waveAmplitude: number;
  waveFrequency: number;
  wavePhase: number;
}

interface Sphere {
  x: number;
  y: number;
  radius: number;
  wireframe: WireframePoint[];
  particles: Particle[];
  brightness: number;
  pulseDirection: number;
  rotation: number;
  rotationSpeed: number;
  lastPulseTime: number;
  pulseInterval: number;
}

export default function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match its display size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        const { devicePixelRatio: ratio = 1 } = window;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        ctx.scale(ratio, ratio);
        return true;
      }
      return false;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Central sphere properties
    const sphere: Sphere = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: Math.min(canvas.width, canvas.height) * 0.22,
      wireframe: [] as WireframePoint[],
      particles: [] as Particle[],
      brightness: 0.5,
      pulseDirection: 0.003, // Reduced pulse speed
      rotation: 0,
      rotationSpeed: 0.0005,
      lastPulseTime: 0,
      pulseInterval: 3000, // Pulse every 3 seconds instead of random
    };

    // Generate wireframe points for the sphere
    for (let i = 0; i < 25; i++) {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      sphere.wireframe.push({
        x: Math.cos(angle1) * Math.sin(angle2),
        y: Math.sin(angle1) * Math.sin(angle2),
        z: Math.cos(angle2),
        opacity: 0.1 + Math.random() * 0.3,
      });
    }

    // Generate orbiting particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = sphere.radius * (0.8 + Math.random() * 0.7);
      const speed = 0.002 + Math.random() * 0.004;
      sphere.particles.push({
        angle,
        distance,
        speed,
        size: 0.8 + Math.random() * 1.5, // Smaller particles
        opacity: 0.3 + Math.random() * 0.5,
        yOffset: Math.random() * 20 - 10,
      });
    }

    // Calculate the outer edge of the canvas from the center point
    const canvasRadius =
      Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) / 2;
    const startDistance = canvasRadius * 0.9; // Start from near the edge

    // Function to create asteroid-like particles
    function createAsteroidParticle(
      distance: number | undefined | null,
      startDist: number
    ): AsteroidParticle {
      // Slightly larger base size
      const baseSize = 1.0 + Math.random() * 1.5; // Increased from 0.5-1.5 to 1.0-2.5

      // Create irregular shape parameters
      const irregularity = 0.2 + Math.random() * 0.4; // How irregular the shape is
      const spikes = 3 + Math.floor(Math.random() * 4); // 3-6 spikes
      const rotation = Math.random() * Math.PI * 2; // Random rotation

      return {
        distance: distance || startDist,
        baseSize,
        size: baseSize, // Current size for drawing
        opacity: 0.1 + Math.random() * 0.5, // Lower opacity
        speed: 0.3 + Math.random() * 1.0, // Slower speed
        // Add individual particle path variation
        offsetX: Math.random() * 40 - 20,
        offsetY: Math.random() * 40 - 20,
        // Add unique curve strength for each particle
        curveStrength: 0.3 + Math.random() * 0.7,
        // Add wave properties for each particle
        wavePhaseOffset: Math.random() * Math.PI * 2,
        waveAmplitudeMultiplier: 0.5 + Math.random() * 1.5,
        // Asteroid shape properties
        irregularity,
        spikes,
        rotation,
        rotationSpeed: Math.random() * 0.01 - 0.005, // Slow rotation
        // Trail properties
        trailLength: 4 + baseSize * 3, // Slightly longer trails (was 3 + baseSize * 2)
        trailOpacity: 0.25 + Math.random() * 0.35, // Slightly increased opacity (was 0.2-0.5)
      };
    }

    // Create data streams
    const streams: Stream[] = [];
    const streamCount = 8;

    for (let i = 0; i < streamCount; i++) {
      const angle = (i * Math.PI * 2) / streamCount;
      const length = canvas.width * 1.0;

      streams.push({
        angle,
        particles: [],
        nextParticleTime: 0,
        // Add curve control points for bezier paths
        curveX: Math.random() * 300 - 150,
        curveY: Math.random() * 300 - 150,
        // Add slight angle variation
        angleVariation: Math.random() * 0.6 - 0.3,
        // Add wave properties
        waveAmplitude: 10 + Math.random() * 30,
        waveFrequency: 0.02 + Math.random() * 0.03,
        wavePhase: Math.random() * Math.PI * 2,
        // Particle generation frequency
        particleInterval: 800 + Math.random() * 1200, // More frequent particles (was 200-600)
      });

      // Create initial particles for each stream
      for (let j = 0; j < 6; j++) {
        // Fewer initial particles (was 12)
        const distance = length * (0.3 + Math.random() * 0.7);
        streams[i].particles.push(
          createAsteroidParticle(distance, startDistance)
        );
      }
    }

    // Add holographic rings
    const rings: Ring[] = [];
    const ringCount = 3;

    for (let i = 0; i < ringCount; i++) {
      rings.push({
        radius: sphere.radius * (1.2 + i * 0.3),
        opacity: 0.12 - i * 0.03, // Slightly reduced opacity
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: 0.0003 + Math.random() * 0.0005,
        segments: 60 + i * 10,
        thickness: 1.2 - i * 0.3, // Slightly thinner
        waveAmplitude: 3 + i * 2,
        waveFrequency: 6 + i * 2,
        wavePhase: Math.random() * Math.PI * 2,
      });
    }

    // Function to draw asteroid-shaped particle
    function drawAsteroidParticle(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      particle: AsteroidParticle,
      opacity: number
    ): void {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(particle.rotation);

      // Draw the irregular asteroid shape
      ctx.beginPath();

      for (let i = 0; i < particle.spikes * 2; i++) {
        const angle = (i * Math.PI * 2) / (particle.spikes * 2);
        const radius =
          i % 2 === 0
            ? particle.size
            : particle.size * (0.6 - particle.irregularity * Math.random());

        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.closePath();
      ctx.fillStyle = `rgba(200, 200, 255, ${opacity})`;
      ctx.fill();

      // Add a subtle highlight to one side
      ctx.beginPath();
      ctx.arc(
        particle.size * 0.3,
        -particle.size * 0.3,
        particle.size * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
      ctx.fill();

      ctx.restore();
    }

    // Animation loop
    let animationFrameId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update sphere center position based on canvas size
      sphere.x = canvas.width / 2;
      sphere.y = canvas.height / 2;
      sphere.radius = Math.min(canvas.width, canvas.height) * 0.22;

      // Update sphere rotation
      sphere.rotation += sphere.rotationSpeed * deltaTime;

      // Pulse the sphere brightness
      sphere.brightness += sphere.pulseDirection;
      if (sphere.brightness > 0.8 || sphere.brightness < 0.4) {
        sphere.pulseDirection *= -1;
      }

      // Draw central sphere
      const gradient = ctx.createRadialGradient(
        sphere.x,
        sphere.y,
        0,
        sphere.x,
        sphere.y,
        sphere.radius
      );

      gradient.addColorStop(0, `rgba(100, 90, 255, ${sphere.brightness})`);
      gradient.addColorStop(
        0.5,
        `rgba(80, 70, 200, ${sphere.brightness * 0.8})`
      );
      gradient.addColorStop(1, `rgba(50, 40, 150, ${sphere.brightness * 0.3})`);

      ctx.beginPath();
      ctx.arc(sphere.x, sphere.y, sphere.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw holographic rings
      for (const ring of rings) {
        ring.rotation += ring.rotationSpeed * deltaTime;
        ring.wavePhase += 0.002 * deltaTime;

        ctx.beginPath();

        for (let i = 0; i <= ring.segments; i++) {
          const angle = (i / ring.segments) * Math.PI * 2;
          const waveOffset =
            Math.sin(angle * ring.waveFrequency + ring.wavePhase) *
            ring.waveAmplitude;
          const radius = ring.radius + waveOffset;

          const x = sphere.x + Math.cos(angle + ring.rotation) * radius;
          const y = sphere.y + Math.sin(angle + ring.rotation) * radius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.strokeStyle = `rgba(150, 150, 255, ${ring.opacity})`;
        ctx.lineWidth = ring.thickness;
        ctx.stroke();
      }

      // Draw wireframe
      for (const point of sphere.wireframe) {
        // Rotate points
        const rotationSpeed = 0.0005;
        const x =
          point.x * Math.cos(time * rotationSpeed) -
          point.z * Math.sin(time * rotationSpeed);
        const z =
          point.x * Math.sin(time * rotationSpeed) +
          point.z * Math.cos(time * rotationSpeed);

        // Project 3D point to 2D
        const projectedX = sphere.x + x * sphere.radius;
        const projectedY = sphere.y + point.y * sphere.radius;

        ctx.beginPath();
        ctx.arc(projectedX, projectedY, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 180, 255, ${point.opacity})`;
        ctx.fill();
      }

      // Draw orbiting particles
      for (const particle of sphere.particles) {
        particle.angle += particle.speed;

        const x = sphere.x + Math.cos(particle.angle) * particle.distance;
        const y =
          sphere.y +
          Math.sin(particle.angle) * particle.distance +
          particle.yOffset;

        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 150, 255, ${particle.opacity})`;
        ctx.fill();

        // Add glow effect to larger particles
        if (particle.size > 1.5) {
          const glow = ctx.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            particle.size * 2
          );
          glow.addColorStop(
            0,
            `rgba(150, 150, 255, ${particle.opacity * 0.4})`
          );
          glow.addColorStop(1, "rgba(150, 150, 255, 0)");

          ctx.beginPath();
          ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
      }

      // Draw and update streams
      for (const stream of streams) {
        // Update wave phase
        stream.wavePhase += 0.01;

        // Add new particles with controlled frequency
        if (time > stream.nextParticleTime) {
          stream.particles.push(createAsteroidParticle(null, startDistance));
          stream.nextParticleTime = time + stream.particleInterval;
        }

        // Update and draw stream particles
        for (let i = stream.particles.length - 1; i >= 0; i--) {
          const particle = stream.particles[i];

          // Move particle toward center (decrease distance)
          particle.distance -= particle.speed;

          // Update particle rotation
          particle.rotation += particle.rotationSpeed * deltaTime;

          // Calculate base angle with variation
          const adjustedAngle = stream.angle + stream.angleVariation;

          // Calculate curved path position using particle's individual offset
          const progress = 1 - particle.distance / (canvas.width * 1.0);
          const curveIntensity =
            Math.sin(progress * Math.PI) * particle.curveStrength;

          // Apply curve to particle position
          const curveX = stream.curveX * curveIntensity;
          const curveY = stream.curveY * curveIntensity;

          // Calculate wave effect
          const wavePhase = stream.wavePhase + particle.wavePhaseOffset;
          const waveEffect =
            Math.sin(progress * 10 + wavePhase) *
            stream.waveAmplitude *
            particle.waveAmplitudeMultiplier *
            progress;

          // Calculate final position with curve, offset, and wave
          const x =
            sphere.x +
            Math.cos(adjustedAngle) * particle.distance +
            curveX +
            particle.offsetX * progress +
            Math.cos(adjustedAngle + Math.PI / 2) * waveEffect;

          const y =
            sphere.y +
            Math.sin(adjustedAngle) * particle.distance +
            curveY +
            particle.offsetY * progress +
            Math.sin(adjustedAngle + Math.PI / 2) * waveEffect;

          // Calculate distance to sphere center
          const dx = x - sphere.x;
          const dy = y - sphere.y;
          const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

          // Remove particles that reach the sphere
          if (distanceToCenter <= sphere.radius) {
            // Create a subtle pulse effect when particle reaches sphere
            ctx.beginPath();
            ctx.arc(sphere.x, sphere.y, sphere.radius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(150, 150, 255, ${particle.opacity * 0.5})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Remove the particle
            stream.particles.splice(i, 1);

            // Increase sphere brightness temporarily (smaller effect)
            sphere.brightness = Math.min(0.85, sphere.brightness + 0.04);
            continue;
          }

          // Fade opacity as it gets closer to the sphere
          const fadeDistance = sphere.radius * 3;
          const normalizedDistance = Math.max(
            0,
            Math.min(1, (distanceToCenter - sphere.radius) / fadeDistance)
          );
          const adjustedOpacity =
            particle.opacity * (1 - normalizedDistance * 0.3);

          // Draw asteroid-shaped particle
          drawAsteroidParticle(ctx, x, y, particle, adjustedOpacity);

          // Draw trail (slightly thicker and longer)
          const trailAngle = Math.atan2(dy, dx) + Math.PI; // Direction away from center

          ctx.beginPath();
          ctx.moveTo(x, y);

          const trailEndX = x + Math.cos(trailAngle) * particle.trailLength;
          const trailEndY = y + Math.sin(trailAngle) * particle.trailLength;

          // Create gradient for trail
          const trailGradient = ctx.createLinearGradient(
            x,
            y,
            trailEndX,
            trailEndY
          );
          trailGradient.addColorStop(
            0,
            `rgba(180, 180, 255, ${adjustedOpacity * particle.trailOpacity})`
          );
          trailGradient.addColorStop(1, "rgba(180, 180, 255, 0)");

          ctx.lineTo(trailEndX, trailEndY);
          ctx.strokeStyle = trailGradient;
          ctx.lineWidth = particle.size * 0.9; // Slightly thicker line (was 0.7)
          ctx.stroke();
        }
      }

      // Add occasional energy pulses from the center (less frequent)
      if (time - sphere.lastPulseTime > sphere.pulseInterval) {
        sphere.lastPulseTime = time;

        interface Pulse {
          radius: number;
          maxRadius: number;
          opacity: number;
          width: number;
        }

        const pulse: Pulse = {
          radius: sphere.radius,
          maxRadius: sphere.radius * (1.5 + Math.random() * 1.0), // Smaller max radius
          opacity: 0.15 + Math.random() * 0.2, // Lower opacity
          width: 0.8 + Math.random() * 1.5, // Thinner pulse
        };

        const expandPulse = () => {
          pulse.radius += 1.5; // Slower expansion
          pulse.opacity *= 0.95;

          ctx.beginPath();
          ctx.arc(sphere.x, sphere.y, pulse.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(150, 150, 255, ${pulse.opacity})`;
          ctx.lineWidth = pulse.width;
          ctx.stroke();

          if (pulse.radius < pulse.maxRadius && pulse.opacity > 0.01) {
            requestAnimationFrame(expandPulse);
          }
        };

        expandPulse();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
