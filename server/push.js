import webpush from 'web-push';
import { db } from './db.js';

let vapidConfigured = false;

function ensureVapidConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:contact@example.com';

  if (!vapidConfigured && publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
  }
  return { publicKey, privateKey };
}

export function getVapidPublicKey() {
  const { publicKey } = ensureVapidConfigured();
  return publicKey || '';
}

export async function saveSubscription(subscription) {
  const { endpoint, keys } = subscription;
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    throw new Error('Abonnement push invalide.');
  }
  await db.run(
    `INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth)
     VALUES (?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET keys_p256dh = excluded.keys_p256dh, keys_auth = excluded.keys_auth`,
    [endpoint, keys.p256dh, keys.auth]
  );
}

export async function sendPushToAll(payload) {
  const { publicKey, privateKey } = ensureVapidConfigured();
  if (!publicKey || !privateKey) return;
  const subs = await db.all('SELECT * FROM push_subscriptions');
  const body = JSON.stringify(payload);

  for (const sub of subs) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
    };
    try {
      await webpush.sendNotification(pushSubscription, body);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await db.run('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
      } else {
        console.error('Erreur envoi push:', err.message);
      }
    }
  }
}
