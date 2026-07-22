import {
	getPlantGeoConfiguration,
	type PlantGeoConfiguration,
	type PlantGeoDisabledReason
} from './config';
import {
	plantGeoContractVersion,
	serializePlantGeoCommerceEvent,
	type PlantGeoCommerceEvent
} from './contracts';

export type PlantGeoFetch = (
	input: URL,
	init: RequestInit
) => Promise<Pick<Response, 'ok' | 'status'>>;

export type PlantGeoDispatchResult =
	| Readonly<{ status: 'skipped'; reason: PlantGeoDisabledReason }>
	| Readonly<{ status: 'sent'; responseStatus: number }>
	| Readonly<{
			status: 'failed';
			reason: 'invalid-payload' | 'remote-rejected' | 'transport-error';
			responseStatus?: number;
	  }>;

/** Best-effort event transport; callers must not place this on a checkout or fulfillment critical path. */
export class PlantGeoClient {
	constructor(
		private readonly configuration: () => PlantGeoConfiguration = getPlantGeoConfiguration,
		private readonly transport: PlantGeoFetch = (input, init) => fetch(input, init)
	) {}

	async sendCommerceEvent(event: PlantGeoCommerceEvent): Promise<PlantGeoDispatchResult> {
		const configuration = this.configuration();
		if (configuration.status !== 'enabled') {
			return { status: 'skipped', reason: configuration.reason };
		}

		let body: string;
		try {
			body = JSON.stringify({
				contractVersion: plantGeoContractVersion,
				event: serializePlantGeoCommerceEvent(event)
			});
		} catch {
			return { status: 'failed', reason: 'invalid-payload' };
		}

		try {
			const response = await this.transport(configuration.eventsEndpoint, {
				method: 'POST',
				credentials: 'omit',
				cache: 'no-store',
				redirect: 'error',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${configuration.apiToken}`,
					'Content-Type': 'application/json',
					'X-Aevani-Service-Identity': configuration.serviceIdentity,
					'X-PlantGeo-Contract-Version': plantGeoContractVersion,
					'X-PlantGeo-Event-Id': event.eventId
				},
				body
			});

			return response.ok
				? { status: 'sent', responseStatus: response.status }
				: { status: 'failed', reason: 'remote-rejected', responseStatus: response.status };
		} catch {
			return { status: 'failed', reason: 'transport-error' };
		}
	}
}

export const plantGeoClient = new PlantGeoClient();
