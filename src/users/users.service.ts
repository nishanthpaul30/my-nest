import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';
import { Role } from './enums/role.enum.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Finds a user by Auth0 ID (sub). If the user does not exist yet,
   * automatically creates them in MongoDB with the default 'user' role.
   */
  async findOrCreateByAuth0Id(auth0Id: string, email?: string): Promise<UserDocument> {
    let user = await this.userModel.findOne({ auth0Id }).exec();

    if (!user) {
      this.logger.log(`New user detected (${auth0Id}). Creating record in MongoDB...`);
      user = await this.userModel.create({
        auth0Id,
        email,
        roles: [Role.USER],
      });
      this.logger.log(`Created MongoDB user with ID ${user._id} and roles: [${user.roles.join(', ')}]`);
    }

    return user;
  }

  /**
   * Finds a user by their Auth0 ID.
   */
  async findByAuth0Id(auth0Id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ auth0Id }).exec();
  }

  /**
   * Assigns new roles to a user in the database.
   */
  async updateRoles(auth0Id: string, roles: Role[]): Promise<UserDocument> {
    const user = await this.userModel.findOneAndUpdate(
      { auth0Id },
      { roles },
      { new: true },
    ).exec();

    if (!user) {
      throw new NotFoundException(`User with Auth0 ID "${auth0Id}" not found in database.`);
    }

    this.logger.log(`Updated roles for user ${auth0Id} to: [${roles.join(', ')}]`);
    return user;
  }

  /**
   * Returns all users in the database.
   */
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
}
