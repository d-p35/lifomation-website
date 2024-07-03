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
  title = 'Lifomation';
  features = [
    { title: 'Advanced Search', description: 'Retrieve documents quickly using natural language queries and OCR technology.' },
    { title: 'Secure Storage', description: 'Your documents are encrypted at rest and in transit to ensure maximum security.' },
    { title: 'Conditional Access', description: 'Share documents securely with family members or trusted individuals.' },
    { title: 'Two-Factor Authentication', description: 'Add an extra layer of security with 2FA.' },
    { title: 'Future Integration', description: 'Automatically receive updates and documents from government services.' }
  ];
  reviews = [
    { text: 'Lifomation has transformed the way I manage my important documents. It\'s secure and so easy to use!', author: 'John Doe' },
    { text: 'The advanced search feature is a game-changer. I can find any document in seconds.', author: 'Jane Smith' },
    { text: 'Sharing documents with my family has never been easier. Lifomation is a must-have for anyone!', author: 'Emily Johnson' }
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
