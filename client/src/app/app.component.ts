// app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { ApiService } from './services/api.service';
import * as THREE from 'three';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'client';
  features = [
    { title: 'Feature 1', description: 'Description for feature 1' },
    { title: 'Feature 2', description: 'Description for feature 2' },
    { title: 'Feature 3', description: 'Description for feature 3' }
  ];
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.initThreeJS();
  }
  initThreeJS() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    const element = document.getElementById('hero-3d-object');
    if (element) {
      element.appendChild(renderer.domElement);
    }
  
    // Create multiple geometries
    const geometries = [
      new THREE.SphereGeometry(5, 32, 32),
      new THREE.BoxGeometry(4, 4, 4),
      new THREE.ConeGeometry(3, 8, 32),
      new THREE.TorusGeometry(3, 1, 16, 100)
    ];
  
    // Create materials
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff5733, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0x33ff57, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0x3357ff, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0xff33a2, wireframe: true })
    ];
  
    // Create mesh array
    const meshes = geometries.map((geometry, index) => new THREE.Mesh(geometry, materials[index]));
  
    // Position meshes randomly
    meshes.forEach(mesh => {
      mesh.position.set(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      );
      scene.add(mesh);
    });
  
    camera.position.z = 30;
  
    const animate = () => {
      requestAnimationFrame(animate);
      meshes.forEach(mesh => {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
      });
      renderer.render(scene, camera);
    };
  
    animate();
  }
  
  
  
  
}
