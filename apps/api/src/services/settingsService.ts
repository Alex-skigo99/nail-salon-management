import {
  SchedulerClient,
  CreateScheduleCommand,
  UpdateScheduleCommand,
  GetScheduleCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-scheduler";
import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import { REMINDER_LAMBDA_ARN, REMINDER_SCHEDULER_ROLE_ARN, REMINDER_SCHEDULER_NAME } from "../config";
import { SETTINGS_KEYS } from "../constants/settings";
import type { Setting } from "../types/dbSchemaTypes";

export async function getAllSettings(): Promise<Setting[]> {
  return knex(DB_TABLES.SETTINGS).select("*").orderBy("key");
}

export async function getSettingByKey(key: string): Promise<Setting | undefined> {
  return knex(DB_TABLES.SETTINGS).where({ key }).first();
}

export async function updateSetting(key: string, value: string): Promise<Setting | null> {
  const [updated] = await knex(DB_TABLES.SETTINGS)
    .where({ key })
    .update({ value, updated_at: knex.fn.now() })
    .returning("*");

  if (updated) {
    if (key === SETTINGS_KEYS.REMINDING_BEFORE) {
      const reminderTimeSetting = await getSettingByKey(SETTINGS_KEYS.REMINDING_TIME);
      const reminderTime = reminderTimeSetting?.value ?? "09:00";
      await syncReminderScheduler({ reminderBefore: Number(value), reminderTime });
    } else if (key === SETTINGS_KEYS.REMINDING_TIME) {
      const reminderBeforeSetting = await getSettingByKey(SETTINGS_KEYS.REMINDING_BEFORE);
      const reminderBefore = Number(reminderBeforeSetting?.value ?? 0);
      await syncReminderScheduler({ reminderBefore, reminderTime: value });
    }
  }

  return updated ?? null;
}

/* helper functions and utils for specific settings */

const schedulerClient = new SchedulerClient({ region: process.env.AWS_REGION ?? "us-east-1" });

function buildSchedulerName(): string {
  const env = process.env.NODE_ENV ?? "development";
  return `${REMINDER_SCHEDULER_NAME}_${env}`;
}

function buildCronExpression(reminderTime: string): string {
  const [hours, minutes] = reminderTime.split(":");
  return `cron(${minutes} ${hours} * * ? *)`;
}

async function getExistingSchedule(name: string): Promise<boolean> {
  try {
    await schedulerClient.send(new GetScheduleCommand({ Name: name }));
    return true;
  } catch (err) {
    if (err instanceof ResourceNotFoundException) return false;
    throw err;
  }
}

export async function syncReminderScheduler({
  reminderBefore,
  reminderTime,
}: {
  reminderBefore: number;
  reminderTime: string;
}): Promise<void> {
  const name = buildSchedulerName();
  const state = reminderBefore > 0 ? "ENABLED" : "DISABLED";
  const scheduleExpression = buildCronExpression(reminderTime);

  const scheduleParams = {
    Name: name,
    ScheduleExpression: scheduleExpression,
    ScheduleExpressionTimezone: "Asia/Jerusalem",
    State: state as "ENABLED" | "DISABLED",
    Target: {
      Arn: REMINDER_LAMBDA_ARN,
      RoleArn: REMINDER_SCHEDULER_ROLE_ARN,
      Input: JSON.stringify({ reminderBefore }),
    },
    FlexibleTimeWindow: { Mode: "OFF" as const },
  };

  const exists = await getExistingSchedule(name);

  if (exists) {
    await schedulerClient.send(new UpdateScheduleCommand(scheduleParams));
  } else {
    await schedulerClient.send(new CreateScheduleCommand(scheduleParams));
  }
}
