import { supabase } from '../supabase/client';

/**
 * Sends a notification email to the expert when a new topic is created
 */
export async function sendNewTopicNotification(
  expertEmail: string,
  topicTitle: string,
  authorName: string,
  topicId: string
) {
  try {
    console.log(`Sending notification to ${expertEmail} about new topic: ${topicTitle}`);
    
    // Call the Supabase function that sends emails
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        recipient: expertEmail,
        subject: `New Forum Question: ${topicTitle}`,
        message: `
          <p>Hello Terri,</p>
          <p>${authorName} has posted a new question in the forum:</p>
          <p><strong>${topicTitle}</strong></p>
          <p>Click the link below to view and respond to this question:</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/forum/topic/${topicId}">View Question</a></p>
          <p>Thank you,</p>
          <p>Westover Heights Medical Forum</p>
        `,
        type: 'new_topic'
      }
    });

    if (error) {
      console.error('Error sending notification:', error);
      throw error;
    }

    console.log('Notification sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Don't throw here - we don't want to fail the topic creation if notification fails
    return null;
  }
}

/**
 * Sends a notification email to the expert when a user adds a follow-up to their question
 */
export async function sendFollowUpNotification(
  expertEmail: string,
  topicTitle: string,
  authorName: string,
  topicId: string
) {
  try {
    console.log(`Sending follow-up notification to ${expertEmail} about topic: ${topicTitle}`);
    
    // Call the Supabase function that sends emails
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        recipient: expertEmail,
        subject: `Follow-up Question: ${topicTitle}`,
        message: `
          <p>Hello Terri,</p>
          <p>${authorName} has posted a follow-up to their question:</p>
          <p><strong>${topicTitle}</strong></p>
          <p>Click the link below to view and respond:</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/forum/topic/${topicId}">View Question</a></p>
          <p>Thank you,</p>
          <p>Westover Heights Medical Forum</p>
        `,
        type: 'follow_up'
      }
    });

    if (error) {
      console.error('Error sending follow-up notification:', error);
      throw error;
    }

    console.log('Follow-up notification sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send follow-up notification:', error);
    // Don't throw here - we don't want to fail the reply creation if notification fails
    return null;
  }
}