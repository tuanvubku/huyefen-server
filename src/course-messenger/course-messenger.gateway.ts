import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/course-messenger' })
export class CourseMessengerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('MessengerGateway');
  manager: any = {};
  socketIds: any = {};

  afterInit() {
    this.logger.log('Initialized gateway');
  }

  handleConnection(client: Socket) {
    this.logger.log('connected');
  }

  handleDisconnect() {
    this.logger.log('One client disconnected!');
  }

  @SubscribeMessage('start')
  handleJoin(
      @MessageBody() payload: { userId: string, courseId: string },
      @ConnectedSocket() client: Socket
  ): void {
    const { userId, courseId } = payload;
    if (userId && courseId) {
      if (this.manager[courseId]) {
        this.manager[courseId][userId] = true;
      }
      else {
        this.manager[courseId] = { [userId]: true };
      }
      client.join(`room-${courseId}`);
      this.socketIds[`${userId}_${courseId}`] = client;
    }
    this.logger.log(`User: ${userId} join conversation: ${courseId}`);
    client.emit('startOk');
  }

  @SubscribeMessage('end')
  handleLeave(
      @MessageBody() payload: { userId: string, courseId: string },
      @ConnectedSocket() client: Socket
  ): void {
    const { userId, courseId } = payload;
    if (userId && courseId) {
      delete this.manager[courseId][userId];
      const key = `${userId}_${courseId}`;
      delete this.socketIds[key];
      this.logger.log(`User ${userId} leave conversation: ${courseId}`);
      client.emit('endOk');
    }
  }

  sendMessage(courseId: string, userId: string, payload: any): void {
    const key = `${userId}_${courseId}`;
    const client = this.socketIds[key];
    if (client)
      client.to(`room-${courseId}`).emit('message', payload);
    else
      this.logger.log('Client isn\'t existed');
  }

  getOnlineStatus(courseId: string): any {
    return this.manager[courseId];
  }
}
