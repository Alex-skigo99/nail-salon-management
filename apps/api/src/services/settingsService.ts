import {
  SchedulerClient,
  CreateScheduleCommand,
  UpdateScheduleCommand,
  DeleteScheduleCommand,
  GetScheduleCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-scheduler";
import { knex } from "../lib/db";
import { DB_TABLES } from "../constants/dbTables";
import {
  REMINDER_LAMBDA_ARN,
  REMINDER_SCHEDULER_ROLE_ARN,
  REMINDER_SCHEDULER_NAME,
  SYNC_CALENDAR_LAMBDA_ARN,
  SYNC_CALENDAR_SCHEDULER_ROLE_ARN,
  SYNC_CALENDAR_SCHEDULER_NAME,
} from "../config";
import { SETTINGS_KEYS } from "../constants/settings";
import type { Setting } from "../types/dbSchemaTypes";

export async function getAllSettings(): Promise<Setting[]> {
  return knex(DB_TABLES.SETTINGS).select("*").orderBy("key");
}

export async function getSettingByKey(key: string): Promise<Setting | undefined> {
  return knex(DB_TABLES.SETTINGS).where({ key }).first();
}

export async function updateSetting(key: string, value: string): Promise<Setting | null> {
  const trx = await knex.transaction();
  try {
    const [updated] = await trx(DB_TABLES.SETTINGS)
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
      } else if (key === SETTINGS_KEYS.ACTIVE_CALENDAR) {
        if (value === "icloud") {
          const syncExpSetting = await getSettingByKey(SETTINGS_KEYS.CALENDAR_SYNC_EXP);
          const scheduleExpression = syncExpSetting?.value ?? "rate(1 day)";
          await upsertSyncCalendarScheduler(scheduleExpression);
        } else {
          await deleteSyncCalendarScheduler();
        }
      } else if (key === SETTINGS_KEYS.CALENDAR_SYNC_EXP) {
        const activeCalendarSetting = await getSettingByKey(SETTINGS_KEYS.ACTIVE_CALENDAR);
        if (activeCalendarSetting?.value === "icloud") {
          await upsertSyncCalendarScheduler(value);
        }
      }
    }

    await trx.commit();
    return updated ?? null;
  } catch (err) {
    await trx.rollback();
    throw err;
  }
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

/* ── Sync Calendar Scheduler helpers ─────────────────────────────────────── */

function buildSyncCalendarSchedulerName(): string {
  const env = process.env.NODE_ENV ?? "development";
  return `${SYNC_CALENDAR_SCHEDULER_NAME}_${env}`;
}

async function upsertSyncCalendarScheduler(scheduleExpression: string): Promise<void> {
  const name = buildSyncCalendarSchedulerName();
  const scheduleParams = {
    Name: name,
    ScheduleExpression: scheduleExpression,
    ScheduleExpressionTimezone: "Asia/Jerusalem",
    State: "ENABLED" as const,
    Target: {
      Arn: SYNC_CALENDAR_LAMBDA_ARN,
      RoleArn: SYNC_CALENDAR_SCHEDULER_ROLE_ARN,
      Input: JSON.stringify({}),
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

async function deleteSyncCalendarScheduler(): Promise<void> {
  const name = buildSyncCalendarSchedulerName();
  const exists = await getExistingSchedule(name);
  if (exists) {
    await schedulerClient.send(new DeleteScheduleCommand({ Name: name }));
  }
}

/* ── Reminder Scheduler helpers ───────────────────────────────────────────── */

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
