
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const ThreeAnimation: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const container = mountRef.current;
        let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, composer: EffectComposer, controls: OrbitControls;
        let mainGroup: THREE.Group, nnGroup: THREE.Group;
        let clock = new THREE.Clock();
        const allNodes: THREE.Mesh[] = [];
        let animationFrameId: number;

        const init = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
            camera.position.z = 15;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 8;
            controls.maxDistance = 40;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.4;
            controls.enableZoom = false;
            controls.enablePan = false;

            mainGroup = new THREE.Group();
            scene.add(mainGroup);

            const glowColor = new THREE.Color(0x3b82f6);

            const ringMaterial = new THREE.MeshBasicMaterial({ color: glowColor, wireframe: true, transparent: true, opacity: 0.1 });
            for (let i = 0; i < 15; i++) {
                const geometry = new THREE.TorusGeometry(6 + Math.random() * 2, 0.01 + Math.random() * 0.03, 16, 100);
                const ring = new THREE.Mesh(geometry, ringMaterial);
                ring.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                const scale = 0.9 + Math.random() * 0.2;
                ring.scale.set(scale, scale, scale);
                mainGroup.add(ring);
            }

            const particlesGeometry = new THREE.BufferGeometry();
            const posArray = new Float32Array(10000 * 3);
            for (let i = 0; i < 10000 * 3; i++) {
                const theta = Math.random() * 2 * Math.PI;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 5.5 + Math.random() * 3;
                posArray[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
                posArray[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                posArray[i * 3 + 2] = r * Math.cos(phi);
            }
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const particleMaterial = new THREE.PointsMaterial({ size: 0.03, color: glowColor, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, sizeAttenuation: true });
            mainGroup.add(new THREE.Points(particlesGeometry, particleMaterial));

            nnGroup = new THREE.Group();
            mainGroup.add(nnGroup);
            buildStaticNeuralNetwork();

            const renderScene = new RenderPass(scene, camera);
            const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.offsetWidth, container.offsetHeight), 1.5, 0.4, 0.85);
            bloomPass.threshold = 0;
            bloomPass.strength = 1.6;
            bloomPass.radius = 0.7;
            composer = new EffectComposer(renderer);
            composer.addPass(renderScene);
            composer.addPass(bloomPass);

            window.addEventListener('resize', onWindowResize, false);
        };

        const buildStaticNeuralNetwork = () => {
            const layerDefs = [6, 8, 10, 8, 6];
            const layerDistance = 2.0;
            const nodeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const layers: { nodePositions: THREE.Vector3[] }[] = [];

            for (let i = 0; i < layerDefs.length; i++) {
                const numNodes = layerDefs[i];
                const layerZ = -(layerDefs.length - 1) * layerDistance / 2 + i * layerDistance;
                const layer = { nodePositions: [] };
                for (let j = 0; j < numNodes; j++) {
                    const angle = (j / numNodes) * Math.PI * 2;
                    const radius = 1.5 + (numNodes > 8 ? 0.8 : 0);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
                    const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
                    nodeMesh.position.set(x, y, layerZ);
                    allNodes.push(nodeMesh);
                    layer.nodePositions.push(nodeMesh.position);
                    nnGroup.add(nodeMesh);
                }
                layers.push(layer);
            }

            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending });
            for (let i = 0; i < layers.length - 1; i++) {
                for (const startPos of layers[i].nodePositions) {
                    for (const endPos of layers[i + 1].nodePositions) {
                        const geometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
                        nnGroup.add(new THREE.Line(geometry, lineMaterial));
                    }
                }
            }
        };

        const onWindowResize = () => {
            camera.aspect = container.offsetWidth / container.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            composer.setSize(container.offsetWidth, container.offsetHeight);
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            mainGroup.rotation.y += 0.0005;
            mainGroup.rotation.x += 0.0002;

            allNodes.forEach((node, index) => {
                const blink = (Math.sin(elapsedTime * 0.5 + index * 0.5) + 1) / 2;
                const scale = 0.5 + blink * 1.2;
                node.scale.setScalar(scale);
                const hue = 0.6 + (Math.sin(elapsedTime * 0.3 + index * 0.4) + 1) / 2 * 0.25;
                (node.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1.0, 0.6 + blink * 0.3);
            });

            controls.update();
            composer.render();
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', onWindowResize);
            cancelAnimationFrame(animationFrameId);
            if(renderer) renderer.dispose();
            // Clean up scene resources
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if(Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            if (container && renderer) {
                container.removeChild(renderer.domElement);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div id="animation-container" ref={mountRef}></div>;
};

export default ThreeAnimation;
