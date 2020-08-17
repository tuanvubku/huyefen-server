import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/chapter' })
export class ChapterGateway {
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('ChapterGateway');
  private socketIds: object = {};

  afterInit() {
    this.logger.log('Initialized chapter gateway')
  }

  handleConnection(client: Socket) {
    const clientId: string = client.id;
    const userId: string = client.handshake.query.userId;
    const lectureId: string = client.handshake.query.lectureId;

    if (userId && lectureId) {
      const key = `${userId}_${lectureId}`;
      this.socketIds[key] = clientId;
      this.logger.log(`New client:  ${userId} + ${lectureId} is connecting!`)
    }
  }

  handleDisconnect() {
    this.logger.log('One client disconnected!');
  }

  notifyVideoUploadIsOk(teacherId: string, lectureId: string, payload) {
    const key: string = `${teacherId}_${lectureId}`;
    const clientId: string = this.socketIds[key];
    if (clientId) {
      this.wss.to(clientId).emit('uploadOk', payload);
    }
    else {
      this.logger.log('Client is not existed');
    }
  }

  @SubscribeMessage('close')
  handleClose(
    @MessageBody() payload: { userId: string, lectureId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.disconnect();
    const { userId, lectureId } = payload;
    const key: string = `${userId}_${lectureId}`;
    if (this.socketIds[key]) {
      delete this.socketIds[key];
    }
  }
}
