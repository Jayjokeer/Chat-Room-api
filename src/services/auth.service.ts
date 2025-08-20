import { User } from '../model/index.model';

export const checkEmailExists = async (email: string) => {
  return await User.findOne({
    where: { email },
  });
};

export const createUser = async (userPayload: any) => {
  return await User.create(userPayload);
};

export const fetchUserById = async (id: string) => {
  return await User.findByPk(id);
};
