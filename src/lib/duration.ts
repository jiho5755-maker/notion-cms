/**
 * Duration 변환 유틸리티
 *
 * 한국어 duration 문자열을 ISO 8601 Duration 형식으로 변환한다.
 */

/**
 * 한국어 duration 문자열을 ISO 8601 Duration 형식으로 변환한다.
 *
 * @example
 * convertDurationToISO("30분")       // "PT30M"
 * convertDurationToISO("1시간")      // "PT1H"
 * convertDurationToISO("1시간 30분") // "PT1H30M"
 * convertDurationToISO("")           // ""
 * convertDurationToISO("잘못된 값")  // ""
 */
export function convertDurationToISO(duration: string): string {
  if (!duration) return "";

  const hourMatch = duration.match(/(\d+)\s*시간/);
  const minuteMatch = duration.match(/(\d+)\s*분/);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  if (hours === 0 && minutes === 0) return "";

  let iso = "PT";
  if (hours > 0) iso += `${hours}H`;
  if (minutes > 0) iso += `${minutes}M`;

  return iso;
}
