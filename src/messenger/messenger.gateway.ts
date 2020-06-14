import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/messenger' })
export class MessengerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() wss: Server;

	private logger: Logger = new Logger('MessengerGateway');
	private available: object = {};
	private socketIds: object = {};

	afterInit() {
		this.logger.log('Initialized gateway');
	}

	handleConnection(client: Socket) {
		const clientId: string = client.id;
		const userId: string = client.handshake.query.userId;
		if (userId) {
			this.socketIds[userId] = clientId;
			this.logger.log(`New client: ${userId} is connecting!`);
		}
	}

	handleDisconnect() {
		this.logger.log('One client disconnected!');
	}

	checkUserInConversation(userId: string, converId: string): boolean {
		return this.available[userId] && (this.available[userId] === converId);
	}

	@SubscribeMessage('start')
	handleJoin(
		@MessageBody() payload: { userId: string, converId: string },
		@ConnectedSocket() client: Socket
	): void {
		const { userId, converId } = payload;
		this.available[userId] = converId;
		this.logger.log(`User: ${userId} join conversation: ${converId}`);
		client.emit('startOk');
	}

	@SubscribeMessage('end')
	handleLeave(
		@MessageBody() payload: { userId: string },
		@ConnectedSocket() client: Socket
	): void {
		const { userId } = payload;
		const converId = this.available[userId];
		if (converId) {
			delete this.available[userId];
			this.logger.log(`User ${userId} leave conversation: ${converId}`);
			client.emit('endOk');
		}
	}

	sendMessage(targetId: string, payload: object): void {
		const clientId: string = this.socketIds[targetId];
		if (clientId)
			this.wss.to(clientId).emit('message', payload);
		else
			this.logger.log('Client isn\'t existed');
	}

	emitSeen(targetId: string, payload: object): void {
		const clientId: string = this.socketIds[targetId];
		if (clientId)
			this.wss.to(clientId).emit('seen', payload);
		else
			this.logger.log('Client isn\'t existed');
	}
}
