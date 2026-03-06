import { type ActorType, type Prisma, prisma } from "@foundry/database";

type LogAuditEventInput = {
	actorId?: string;
	actorType: ActorType;
	action: string;
	targetId: string;
	targetType: string;
	scope?: string;
	metadata?: unknown;
	pageId?: string;
};

export async function logAuditEvent(data: LogAuditEventInput) {
	const createData: Prisma.AuditEventUncheckedCreateInput = {
		actorType: data.actorType,
		action: data.action,
		targetId: data.targetId,
		targetType: data.targetType,
		...(data.actorId ? { actorId: data.actorId } : {}),
		...(data.scope ? { scope: data.scope } : {}),
		...(data.metadata !== undefined
			? { metadata: data.metadata as Prisma.InputJsonValue }
			: {}),
		...(data.pageId ? { pageId: data.pageId } : {}),
	};

	return prisma.auditEvent.create({ data: createData });
}
