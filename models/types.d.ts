import { Types } from 'mongoose';

export interface IClient {
  _id: Types.ObjectId;
  name: string;
  completeName?: string;
  identificationId?: string;
  identificationType?: string;
  email?: string;
  address?: string;
  imgLogo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContract {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  identifier: number;
  vendorId?: Types.ObjectId;
  title: string;
  status: number;
  currency: string;
  netAmount: number;
  balance?: number;
  profitability?: number;
  termsOfPayment: string;
  creatorId?: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IProject {
  _id: Types.ObjectId;
  contractId: Types.ObjectId;
  identifier: number;
  title: string;
  projectType: number;
  status: number;
  netAmount?: number;
  balance?: number;
  currency?: string;
  kickOff?: Date;
  end?: Date;
  rentability?: number;
  percentageComplete?: number;
  estimatedHrs?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITask {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  priority: number;
  taskType: number;
  status: number;
  assignedTo?: Types.ObjectId;
  weight?: number;
  estimatedWeight?: number;
  title: string;
  description?: string;
  logs?: Array<{
    collaboratorId: Types.ObjectId;
    date: Date;
    entry: string;
    hours?: number;
  }>;
  todos?: Array<{
    finishedAt?: Date;
    title: string;
    hours: number;
  }>;
  startDate?: Date;
  endDate?: Date;
  progress?: number;
  hours?: number;
  createdAt?: Date;
  updatedAt?: Date;
}