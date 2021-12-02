import AWS from 'aws-sdk';

const params: AWS.EC2.StartInstancesRequest = {
  InstanceIds: [process.env.INSTANCE_ID as string]
};

const ec2 = new AWS.EC2({
  region: process.env.REGION
});

export const start = async (): Promise<void> => {
  try {
    await ec2.startInstances(params).promise();
  } catch (error: unknown) {
    console.error(error);
  }
};

export const stop = async (): Promise<void> => {
  try {
    await ec2.stopInstances(params).promise();
  } catch (error: unknown) {
    console.error(error);
  }
};
