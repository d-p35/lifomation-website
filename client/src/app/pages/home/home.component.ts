import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HomeHeaderComponent } from '../../layout/home-header/header.component';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { ApiService } from '../../services/api.service';
import { combineLatest } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, HomeHeaderComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  title = 'Lifomation';
  features = [
    {
      title: 'Secure Storage',
      description: 'Keep your documents safe and secure.',
      icon: '../../..//public/secure-icon.png',
    },
    {
      title: 'Easy Access',
      description: 'Access your documents from anywhere.',
      icon: '../../..//public/access-icon.png',
    },
    {
      title: 'Organized',
      description: 'Keep your documents well-organized.',
      icon: '../../..//public/organized-icon.png',
    },
    {
      title: 'Advanced Search',
      description: 'Find documents quickly and easily.',
      icon: '../../..//public/advanced-search.png',
    },
    {
      title: 'Secure Sharing',
      description: 'Share documents securely.',
      icon: '../../..//public/share-icon.png',
    },
  ];

  steps = [
    {
      title: 'Sign Up',
      description:
        'Create an account using your email and set up your profile.',
    },
    {
      title: 'Upload Documents',
      description:
        'Easily upload your important documents in various categories.',
    },
    {
      title: 'Organize & Categorize',
      description:
        'Organize your documents with categories and subcategories for easy access.',
    },
    {
      title: 'Advanced Search',
      description:
        'Use the powerful search feature to find documents quickly and easily.',
    },
    {
      title: 'Share Securely',
      description:
        'Share documents with family or trusted individuals securely.',
    },
  ];

  testimonials = [
    {
      text: 'Lifomation has changed the way I manage my documents.',
      author: 'John Doe',
    },
    {
      text: 'The best document management solution I have used.',
      author: 'Jane Smith',
    },
    {
      text: 'A lifesaver for managing important documents.',
      author: 'Alex Johnson',
    },
  ];

  pricingPlans = [
    {
      title: 'Basic',
      price: '$9.99/month',
      features: ['1 GB Storage', 'Basic Support', 'Access from Any Device'],
    },
    {
      title: 'Standard',
      price: '$19.99/month',
      features: [
        '10 GB Storage',
        'Priority Support',
        'Access from Any Device',
        'Secure Sharing',
      ],
    },
    {
      title: 'Premium',
      price: '$29.99/month',
      features: [
        'Unlimited Storage',
        '24/7 Support',
        'Access from Any Device',
        'Secure Sharing',
        'Advanced Search',
      ],
    },
  ];

  blogPosts = [
    {
      title: 'How to Keep Your Documents Secure',
      image: '../../..//public/blogging.png',
      excerpt:
        'Learn the best practices for keeping your documents secure in the digital age.',
    },
    {
      title: 'The Benefits of Digital Document Management',
      image: '../../..//public/blogging.png',
      excerpt: 'Discover the advantages of managing your documents digitally.',
    },
    {
      title: 'Top Features of Lifomation',
      image: '../../..//public/blogging.png',
      excerpt:
        'Explore the top features that make Lifomation the best choice for document management.',
    },
  ];

  faqs = [
    {
      question: 'What is Lifomation?',
      answer:
        'Lifomation is a secure solution for managing and accessing important documents anytime, anywhere.',
    },
    {
      question: 'How do I sign up?',
      answer:
        'You can sign up by creating an account using your email and setting up your profile.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes, we use advanced encryption and security measures to keep your data safe.',
    },
    {
      question: 'Can I share documents?',
      answer:
        'Yes, you can securely share documents with family or trusted individuals.',
    },
  ];

  constructor(private apiService: ApiService, private router: Router, public auth: AuthService) {} // Step 2: Inject Router
  userId: string | undefined;

  ngOnInit(): void {
    // this.apiService.isAuthenticated$.subscribe((isAuthenticated) => {
    //   if (isAuthenticated) {
    //     console.log('User is authenticated');
    //     // print user id
    //     this.router.navigate(['/dashboard']);
    //   }
    // });

    combineLatest([
      this.apiService.getUserId(),
      this.apiService.getUserEmail(),
    ]).subscribe(
      ([userId, email]: [string | undefined, string | undefined]) => {
        if (
          userId &&
          userId !== 'Unknown UID' &&
          email &&
          email !== 'Unknown Email'
        ) {
          this.apiService.createUser(userId, email).subscribe((response) => {
            this.router.navigate(['/dashboard']);
          });
        } else {
          console.error('User ID or Email not found');
        }
      }
    );
  }

  initThreeJS() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
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
      new THREE.TorusGeometry(3, 1, 16, 100),
    ];

    // Create materials
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff5733, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0x33ff57, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0x3357ff, wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 0xff33a2, wireframe: true }),
    ];

    // Create mesh array
    const meshes = geometries.map(
      (geometry, index) => new THREE.Mesh(geometry, materials[index])
    );

    // Position meshes randomly
    meshes.forEach((mesh) => {
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
      meshes.forEach((mesh) => {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
      });
      renderer.render(scene, camera);
    };

    animate();
  }
}
