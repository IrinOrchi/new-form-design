
import { RouterOutlet } from '@angular/router';
import {
  Component,
  ElementRef,
  ViewChild,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-nid-verification',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule, JsonPipe, HeaderComponent],
  templateUrl: './before-login-nid.component.html',
  styleUrl: './before-login-nid.component.scss'
})
export class BeforeLoginNidComponent  implements OnDestroy, OnInit{
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;

  // nidService = inject(NidVerificationService);

  nidForm: FormGroup;
  nidImage: string = 'images/nidImage.svg';
  recordingAttemptIcon: string = 'images/recordingAttempt.svg';
  capturedPhoto: string = '';
  stream!: MediaStream | null;
  photoCaptured: boolean = false;
  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private _platform: Object
  ) {
    this.nidForm = this.fb.group({
      nid: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(17),
        ],
      ],
      dob: ['', Validators.required],
      photo: ['', Validators.required],
    });
  }
  async ngOnInit() {
    let stream = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.onStart();
    } catch (err) {
      console.log(err);
    }
  }

  get nid() {
    return this.nidForm.get('nid');
  }

  get dob() {
    return this.nidForm.get('dob');
  }

  get photo() {
    return this.nidForm.get('photo');
  }

  onStart() {
    if (isPlatformBrowser(this._platform) && 'mediaDevices' in navigator) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream: MediaStream) => {
          this.stream = stream;
          const _video = this.video.nativeElement;

          if (_video && _video instanceof HTMLVideoElement) {
            _video.srcObject = stream;
            _video.play();
          }
        })
        .catch((err) => {
          console.error('Error accessing camera: ', err);
        });
    }
  }

  onStop() {
    const _video = this.video.nativeElement;

    if (_video && _video instanceof HTMLVideoElement) {
      if (typeof _video.pause === 'function') {
        _video.pause();
      }

      const stream = _video.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        _video.srcObject = null;
        this.stream = null;
      }
    } else {
      console.error('The video element is not properly initialized.');
    }
  }

  capturePhoto() {
    if (!this.stream) {
      this.onStart();
    }
  }

  captureImageFromVideo() {
    const _video = this.video.nativeElement;

    if (_video && _video instanceof HTMLVideoElement) {
      const canvas = document.createElement('canvas');
      canvas.width = _video.videoWidth;
      canvas.height = _video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(_video, 0, 0, canvas.width, canvas.height);
        this.capturedPhoto = canvas.toDataURL('image/png');
        this.nidForm.patchValue({ photo: this.capturedPhoto });
        this.photoCaptured = true; // Set the flag to true after photo is captured
        console.log(this.capturedPhoto);
      }
    } else {
      console.error('Video element is not available or initialized');
    }
  }

  changePhoto() {
    this.capturedPhoto = '';
    this.photoCaptured = false;
    this.onStart();
  }

  ngOnDestroy() {
    if (this.video && this.video.nativeElement instanceof HTMLVideoElement) {
      const _video = this.video.nativeElement;
      if (_video.srcObject) {
        this.onStop();
      }
    }
  }

  onSubmit() {
    if (this.nidForm.valid) {
      let imgstr = this.capturedPhoto.split(',')[1];
     
    }
  }
  
}
