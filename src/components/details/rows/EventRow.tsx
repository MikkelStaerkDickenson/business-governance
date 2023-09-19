import * as React from "react";
import { EntityDetailsRow } from "@/contexts/EntityLayoutsContext";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useSP } from "@/hooks/useSP";
import { Services } from "@/services/Services";
import { Entity } from "@/types/Entity";
import { EventItem } from "@/types/items/EventItem";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useQuery } from "react-query";
import { DetailsRow } from "../DetailsRow";
dayjs.extend(utc);

type Props = {
    entity: Entity;
    row: EntityDetailsRow;
};

export const EventRow = (props: Props) => {
    const { row, entity } = props;
    const { sp } = useSP();
    const configuration = useConfiguration();

    const { data: event } = useQuery({
        queryKey: ["meetingInfo", entity.id],
        queryFn: async () => {
            const timeZoneInfo = await sp.web.regionalSettings.timeZone();

            const offset =
                -(
                    timeZoneInfo.Information.Bias +
                    timeZoneInfo.Information.StandardBias +
                    timeZoneInfo.Information.DaylightBias
                ) / 60.0;

            const events = await Services.entityEventService.getEntityEvents(
                sp,
                configuration!,
                entity.id
            );

            if (!events || events.length === 0) {
                return undefined;
            }

            const event: EventItem = events[0];

            const format = "DD-MM-YYYY HH:mm";
            const startDate = event.Start
                ? dayjs(event.Start).utc(true).utcOffset(offset).format(format)
                : "";
            const endDate = event.End
                ? dayjs(event.End).utc(true).utcOffset(offset).format(format)
                : "";

            return {
                title: events[0].Title,
                startDate,
                endDate,
            };
        },
    });

    if (!event) {
        return null;
    }

    return (
        <DetailsRow {...row}>
            <div className="flex flex-row gap-5 text-[smaller]">
                <div>
                    <div className="font-bold">Title</div>
                    <div>{event.title}</div>
                </div>
                <div>
                    <div className="font-bold">Start</div>
                    <div>{event.startDate}</div>
                </div>
                <div>
                    <div className="font-bold">End</div>
                    <div>{event.endDate}</div>
                </div>
            </div>
        </DetailsRow>
    );
};
