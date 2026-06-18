import { ErgastResponse } from './types';

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

export async function getCurrentDriverStandings() {
  const response = await fetch(`${BASE_URL}/current/driverStandings.json`);
  if (!response.ok) throw new Error('Failed to fetch standings');
  const data: ErgastResponse<any> = await response.json();
  return data.MRData.StandingsTable?.StandingsLists[0]?.DriverStandings || [];
}

export async function getCurrentConstructorStandings() {
  const response = await fetch(`${BASE_URL}/current/constructorStandings.json`);
  if (!response.ok) throw new Error('Failed to fetch standings');
  const data: ErgastResponse<any> = await response.json();
  return data.MRData.StandingsTable?.StandingsLists[0]?.ConstructorStandings || [];
}

export async function getCurrentSchedule() {
  const response = await fetch(`${BASE_URL}/current.json`);
  if (!response.ok) throw new Error('Failed to fetch schedule');
  const data: ErgastResponse<any> = await response.json();
  return data.MRData.RaceTable?.Races || [];
}

export async function getLastRaceResults() {
  const response = await fetch(`${BASE_URL}/current/last/results.json`);
  if (!response.ok) throw new Error('Failed to fetch results');
  const data: ErgastResponse<any> = await response.json();
  return data.MRData.RaceTable?.Races[0] || null;
}

export async function getScheduleByYear(season: string) {
  const response = await fetch(`${BASE_URL}/${season}.json`);
  if (!response.ok) throw new Error(`Failed to fetch schedule for ${season}`);
  const data: ErgastResponse<any> = await response.json();
  return data.MRData.RaceTable?.Races || [];
}

export async function getRaceResults(season: string, round: string) {
  const response = await fetch(`${BASE_URL}/${season}/${round}/results.json`);
  if (!response.ok) throw new Error('Failed to fetch race results');
  const data: ErgastResponse<any> = await response.json();
  return data.MRData.RaceTable?.Races[0] || null;
}

export async function getDriverStandingsByYear(season: string) {
  const response = await fetch(`${BASE_URL}/${season}/driverStandings.json`);
  if (!response.ok) throw new Error(`Failed to fetch driver standings for ${season}`);
  const data: ErgastResponse<any> = await response.json();
  return data.MRData.StandingsTable?.StandingsLists[0]?.DriverStandings || [];
}

export async function getConstructorStandingsByYear(season: string) {
  const response = await fetch(`${BASE_URL}/${season}/constructorStandings.json`);
  if (!response.ok) throw new Error(`Failed to fetch constructor standings for ${season}`);
  const data: ErgastResponse<any> = await response.json();
  return data.MRData.StandingsTable?.StandingsLists[0]?.ConstructorStandings || [];
}
