import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FirebaseService } from '../../../providers/firebase/firebase.service';

@Injectable()
export class FirebaseAuthMiddleware implements NestMiddleware {
  constructor(private readonly firebaseService: FirebaseService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req['user'] = null;
      return next();
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firebaseService.getAuth().verifyIdToken(token);
      req['user'] = decodedToken;
      return next();
    } catch (err) {
      req['user'] = null;
      return next();
    }
  }
}
