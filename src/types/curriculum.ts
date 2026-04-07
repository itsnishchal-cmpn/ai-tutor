export interface Topic {
  id: string;
  title: string;
  description: string;
}

export interface Section {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  className: number;
  subject: string;
  sections: Section[];
  locked?: boolean;
}
