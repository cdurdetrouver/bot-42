import { Mutex } from 'async-mutex';
import { user } from '../typings/user';

export class UserQueue {
	private queue: user[];
	private mutex: Mutex;

	constructor() {
		this.queue = [];
		this.mutex = new Mutex();
	}

	async addUser(user: user): Promise<void> {
		await this.mutex.runExclusive(() => {
			this.queue.push(user);
		});
	}

	async getFirstUser(): Promise<user | undefined> {
		return await this.mutex.runExclusive(() => {
			return this.queue[0];
		});
	}

	async getLastUser(): Promise<user | undefined> {
		return await this.mutex.runExclusive(() => {
			return this.queue[this.queue.length - 1];
		});
	}

	async getSize(): Promise<number> {
		return await this.mutex.runExclusive(() => {
			return this.queue.length;
		});
	}

	async removeUser(user: user): Promise<boolean> {
		return await this.mutex.runExclusive(() => {
			const index = this.queue.findIndex(u => u["_id"].equals(user["_id"]));
			if (index !== -1) {
				this.queue.splice(index, 1);
				return true;
			}
			return false;
		});
	}

	async rotateQueue(): Promise<void> {
		return await this.mutex.runExclusive(() => {
			const first = this.queue.shift();
			if (first) {
				this.queue.push(first);
			}
		});
	}

	async updateUser(user: user): Promise<void> {
		return await this.mutex.runExclusive(() => {
			if (!user) return;
			const index = this.queue.findIndex(u => u["_id"].equals(user["_id"]));
			if (index !== -1) {
				this.queue[index] = user;
			}
		});
	}

	async getQueue(): Promise<user[]> {
		return await this.mutex.runExclusive(() => {
			return this.queue;
		});
	}
}
