export namespace ProjectTrackEntity {
    export class Project {
        Id: number;
        Description: string;
        ProjectTrackList: Track[];
    }

    export class Track {
        Id: number;
        ProjectId: number;
        Description: string;
    }

    export class TaskQuality {
        Id: number;
        Description: string;
    }

    export class TaskStatus {
        Id: number;
        Description: string;
    }

    export class MasterData {
        TaskStatusList: TaskStatus[];
        TaskQualityList: TaskQuality[];
        Projects: Project[];
    }

    export class TaskDetail {
        EntryDate: string;
        EmployeeId: string;
        ProjectTrackId: number;
        StartDate: string;
        EndDate: string;
        TaskStatusId: number;
        TaskQualityId: number;
    }

    export class ResponseFromDB {
        Message: string;
        Status: boolean;
        StatusCode: number;
        ResponseData: object;
    }

    export class TodaysEntryCheck {
        EmployeeId: string;
        EntryDate: Date;
    }
}