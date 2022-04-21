// ========== User Entity
// import all modules
import {
	Column,
	Model,
	Table,
	Default,
	Unique,
	UpdatedAt,
	CreatedAt,
	DeletedAt,
	HasMany,
} from 'sequelize-typescript';
import { Voice } from 'src/voice/voice.entity';
import { Text } from '../text/text.entity';

@Table
export class User extends Model {
	@Column
	fullName: string;

	@Unique
	@Column
	username: string;

	@Default('nophoto.png')
	@Column
	photo: string;

	@Column
	password: string;

	@Column
	otp: string;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	@HasMany(() => Text)
	texts: Text[];

	@HasMany(() => Voice)
	voices: Voice[];
}
