"use client";

import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const getBrowserTime = (timezone?: string) => {
  const now = new Date();
  const opts: Record<string, string> = { timeStyle: "short" };

  if (!!timezone) {
    opts["timeZone"] = timezone;
  }

  const formattedTime = now.toLocaleTimeString([], opts);

  return formattedTime;
};

const timezoneOptions = [
  { label: "Eastern Standard Time", value: "America/New_York" },
  { label: "Central Standard Time", value: "America/Chicago" },
  { label: "Mountain Standard Time", value: "America/Denver" },
  { label: "Pacific Standard Time", value: "America/Los_Angeles" },
  { label: "Alaska Standard Time", value: "America/Juneau" },
  { label: "Hawaii-Aleutian Standard Time", value: "Pacific/Honolulu" },
];

interface Timezone {
  label: string;
  zone: string;
  isLocal: boolean;
}

interface TimezoneFormProps {
  onSubmit: React.FormEventHandler<TimezoneFormElement>;
}

interface FormElements extends HTMLFormControlsCollection {
  label: HTMLInputElement;
  timezone: HTMLInputElement;
}

interface TimezoneFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const useTimekeeperDB = (): [
  Timezone[],
  Dispatch<SetStateAction<Timezone[]>>
] => {
  const key = "timekeeperdb";

  const [value, setValue] = useState<Timezone[]>(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : [];
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

const Form = ({ onSubmit }: TimezoneFormProps) => {
  return (
    <form
      className="-mx-4 mt-10 p-4 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg"
      onSubmit={onSubmit}
    >
      <div>
        <label
          htmlFor="label"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Label
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="label"
            id="label"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Label"
          />
        </div>
      </div>
      <div className="mt-4">
        <label
          htmlFor="timezone"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Location
        </label>
        <select
          id="timezone"
          name="timezone"
          className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="">Select a timezone</option>
          {timezoneOptions.map((tz, index) => (
            <option key={index} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="mt-2 block rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        Save
      </button>
    </form>
  );
};

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [timezones, setTimezones] = useTimekeeperDB();

  console.log(timezones);

  useEffect(() => {
    const hasLocalTimezone = timezones.filter((tz) => tz.isLocal).length == 1;

    if (hasLocalTimezone) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const localTimezone: Timezone = {
      label: "Local",
      zone: timezone,
      isLocal: true,
    };

    setTimezones([localTimezone]);
  }, []);

  const sortedZones = useMemo(() => {
    return timezones.sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
  }, [timezones]);

  const handleSubmit = (event: React.FormEvent<TimezoneFormElement>) => {
    event.preventDefault();

    const { label, timezone } = event.currentTarget.elements;

    if (label.value === "" || timezone.value === "") return;

    const newTimezone: Timezone = {
      label: label.value,
      zone: timezone.value,
      isLocal: false,
    };

    setTimezones((prevTimezones) => {
      const prev = prevTimezones.filter((tz) => tz.zone !== newTimezone.zone);

      return [...prev, newTimezone];
    });

    event.currentTarget.reset();
    setShowForm(false);
  };

  const handleDelete = (
    event: React.MouseEvent<HTMLButtonElement>,
    labelToRemove: string
  ) => {
    event.preventDefault();

    const newTimezones = timezones.filter(
      (timezone) => timezone.label !== labelToRemove
    );

    setTimezones(newTimezones);
  };

  return (
    <div className="mt-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Time Keeper
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            This app helps you keep track of your friends&rsquo; timezones!
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add timezone
          </button>
        </div>
      </div>
      {showForm && <Form onSubmit={handleSubmit} />}
      <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Label
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Timezone
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Local Time
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Delete</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedZones.map((tz, index) => (
              <tr key={index}>
                <td
                  className={classNames(
                    index === 0 ? "" : "border-t border-transparent",
                    "relative py-4 pl-4 pr-3 text-sm sm:pl-6"
                  )}
                >
                  <div className="font-medium text-gray-900">
                    {tz.label}
                    {tz.isLocal ? (
                      <span className="ml-1 text-indigo-600">(You)</span>
                    ) : null}
                  </div>
                  {index !== 0 ? (
                    <div className="absolute -top-px left-6 right-0 h-px bg-gray-200" />
                  ) : null}
                </td>
                <td
                  className={classNames(
                    index === 0 ? "" : "border-t border-gray-200",
                    "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                  )}
                >
                  {tz.zone}
                </td>
                <td
                  className={classNames(
                    index === 0 ? "" : "border-t border-gray-200",
                    "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                  )}
                >
                  {getBrowserTime(tz.zone)}
                </td>
                <td
                  className={classNames(
                    index === 0 ? "" : "border-t border-transparent",
                    "relative py-3.5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                  )}
                >
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, tz.label)}
                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                  >
                    Delete<span className="sr-only">, {tz.label}</span>
                  </button>
                  {index !== 0 ? (
                    <div className="absolute -top-px left-0 right-6 h-px bg-gray-200" />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
