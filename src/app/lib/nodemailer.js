import nodemailer from "nodemailer";
import config from "../config/index.js";
export const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: config.SMTP_USER,
		pass: config.SMTP_PASSWORD,
	},
});
// ============================================
// Send Email
// ============================================
// interface SendEmailOptions {
//   to: string;
//   subject: string;
//   html: string;
// }
// export const sendEmail = async ({
//   to,
//   subject,
//   html,
// }: SendEmailOptions) => {
//   await transporter.sendMail({
//     from: config.SMTP_USER,
//     to,
//     subject,
//     html,
//   });
// };
//# sourceMappingURL=nodemailer.js.map
