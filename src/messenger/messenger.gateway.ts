import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/messenger' })
export class MessengerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() wss: Server;

	private logger: Logger = new Logger('MessengerGateway');
	private rooms: object = {};

	afterInit(){
		this.logger.log('Initialized gateway');
	}

	handleConnection() {
		this.logger.log('New client is connecting!');
	}

	handleDisconnect() {
		this.logger.log('One client disconnected!');
	}

	checkClientInRoom(client: string, room: string) {
		return this.rooms[room] && this.rooms[room].has(client);
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(
		@MessageBody() payload: { userId: string, room: string },
		@ConnectedSocket() client: Socket
	): void {
		const { userId, room } = payload;
		if (this.rooms[room] && this.rooms[room].has(userId)) {
			client.emit('roomJoined', room);
		}
		else {
			client.join(room);
			if (!this.rooms[room])
				this.rooms[room] = new Set([userId]);
			else
				this.rooms[room].add(userId);
			client.emit('joinRoomSuccess', room);
		}
	}

	@SubscribeMessage('leaveRoom')
	handleLeaveRoom(
		@MessageBody() payload: { userId: string, room: string },
		@ConnectedSocket() client: Socket
	): void {
		const { userId, room } = payload;
		client.leave(room);
		this.rooms[room].delete(userId);
		if (!this.rooms[room].size)
			delete this.rooms[room];
		client.emit('leaveRoomSuccess', room);
	}
}
