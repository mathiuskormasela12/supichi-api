// ========== Text Entity
// import all modules
import {
	BelongsTo,
	Column,
	CreatedAt,
	DataType,
	DeletedAt,
	ForeignKey,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import { User } from 'src/user/user.entity';

@Table
export class Text extends Model {
	@Column(DataType.TEXT)
	text: string;

	@Column
	renderFrom: string;

	@ForeignKey(() => User)
	@Column
	userId: number;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	@BelongsTo(() => User)
	users: User;
}
