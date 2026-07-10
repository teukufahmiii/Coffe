import { supabase } from "@/integrations/supabase/client";

/**
 * Log an event to the system_logs table
 */
export async function logSystemEvent(
  level: "info" | "warn" | "error" | "fatal",
  message: string,
  context?: any
) {
  try {
    await supabase.from("system_logs").insert({
      level,
      message,
      context: context || {},
    });
  } catch (error) {
    // Failsafe: don't crash if logging fails
    console.error("Failed to write to system_logs:", error);
  }
}

/**
 * Log an audit activity to the audit_logs table
 */
export async function logAuditActivity(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: any
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    await supabase.from("audit_logs").insert({
      user_id: session?.user?.id || null,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details || {},
    });
  } catch (error) {
    console.error("Failed to write to audit_logs:", error);
  }
}

