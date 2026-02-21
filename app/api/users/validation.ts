import type {
  AddressInput,
  UserLoginPayload,
  UserRegistrationPayload,
  UserUpdatePayload
} from "@/types/user";

const PHONE_REGEX = /^[0-9+\-\s()]*$/;

export type ValidationIssue = {
  path: string;
  message: string;
};

export class ValidationError extends Error {
  issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super("Validation failed");
    this.name = "ValidationError";
    this.issues = issues;
  }

  flatten() {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of this.issues) {
      if (!fieldErrors[issue.path]) {
        fieldErrors[issue.path] = [];
      }

      fieldErrors[issue.path].push(issue.message);
    }

    return {
      fieldErrors,
      formErrors: this.issues.map((issue) => `${issue.path}: ${issue.message}`)
    };
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StringConstraints = {
  minLength?: number;
  maxLength?: number;
  email?: boolean;
};

type ReadStringOptions = StringConstraints & {
  required?: boolean;
  nullable?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  { minLength, maxLength, email, required }: ReadStringOptions = {}
): string | undefined {
  if (typeof value !== "string") {
    issues.push({ path, message: "Debe ser una cadena de texto." });
    return undefined;
  }

  const trimmed = value.trim();

  if (!required && trimmed.length === 0) {
    return undefined;
  }

  if (minLength !== undefined && trimmed.length < minLength) {
    issues.push({ path, message: `Debe tener al menos ${minLength} caracteres.` });
    return undefined;
  }

  if (maxLength !== undefined && trimmed.length > maxLength) {
    issues.push({ path, message: `Debe tener como máximo ${maxLength} caracteres.` });
    return undefined;
  }

  if (email && !EMAIL_REGEX.test(trimmed)) {
    issues.push({ path, message: "Debe ser un correo electrónico válido." });
    return undefined;
  }

  return trimmed;
}

function readField(
  source: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
  options: ReadStringOptions = {}
): string | null | undefined {
  if (!(key in source) || source[key] === undefined) {
    if (options.required) {
      issues.push({ path, message: "Campo requerido." });
    }

    return undefined;
  }

  if (source[key] === null) {
    if (options.nullable) {
      return null;
    }

    issues.push({ path, message: "No puede ser nulo." });
    return undefined;
  }

  return readString(source[key], path, issues, options);
}

function validateAddresses(
  source: Record<string, unknown>,
  issues: ValidationIssue[]
): AddressInput[] | undefined {
  if (!("addresses" in source) || source.addresses === undefined) {
    return undefined;
  }

  const value = source.addresses;

  if (value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    issues.push({ path: "addresses", message: "Debe ser una lista de direcciones." });
    return undefined;
  }

  const addresses: AddressInput[] = [];

  value.forEach((entry, index) => {
    const pathPrefix = `addresses[${index}]`;

    if (!isRecord(entry)) {
      issues.push({ path: pathPrefix, message: "Debe ser un objeto." });
      return;
    }

    let isValid = true;

    const label = readField(entry, "label", `${pathPrefix}.label`, issues, { required: true, minLength: 1 });
    const street = readField(entry, "street", `${pathPrefix}.street`, issues, { required: true, minLength: 1 });
    const city = readField(entry, "city", `${pathPrefix}.city`, issues, { required: true, minLength: 1 });
    const country = readField(entry, "country", `${pathPrefix}.country`, issues, { required: true, minLength: 1 });
    const postal = readField(entry, "postal", `${pathPrefix}.postal`, issues, { required: true, minLength: 1 });

    if (label === undefined || street === undefined || city === undefined || country === undefined || postal === undefined) {
      isValid = false;
    }

    if (isValid) {
      addresses.push({
        label: label!,
        street: street!,
        city: city!,
        country: country!,
        postal: postal!
      });
    }
  });

  return addresses;
}

function ensurePayload(data: unknown): Record<string, unknown> {
  if (!isRecord(data)) {
    throw new ValidationError([{ path: "root", message: "Debe ser un objeto." }]);
  }

  return data;
}

export function validateCreateUserPayload(data: unknown): UserRegistrationPayload {
  const issues: ValidationIssue[] = [];
  const payload = ensurePayload(data);

  const email = readField(payload, "email", "email", issues, { required: true, minLength: 1, email: true });
  const password = readField(payload, "password", "password", issues, { required: true, minLength: 8 });
  const name = readField(payload, "name", "name", issues, { minLength: 2, maxLength: 120 });
  const lastName = readField(payload, "lastName", "lastName", issues, { minLength: 2, maxLength: 120 });
  const addresses = validateAddresses(payload, issues);

  if (
    issues.length > 0 ||
    email === undefined ||
    email === null ||
    password === undefined ||
    password === null
  ) {
    throw new ValidationError(issues);
  }

  const result: UserRegistrationPayload = { email, password };

  if (typeof name === "string" && name.length > 0) {
    result.name = name;
  }

  if (typeof lastName === "string" && lastName.length > 0) {
    result.lastName = lastName;
  }

  if (Array.isArray(addresses) && addresses.length > 0) {
    result.addresses = addresses;
  }

  return result;
}

export function validateLoginPayload(data: unknown): UserLoginPayload {
  const issues: ValidationIssue[] = [];
  const payload = ensurePayload(data);

  const email = readField(payload, "email", "email", issues, { required: true, minLength: 1, email: true });
  const password = readField(payload, "password", "password", issues, { required: true, minLength: 1 });

  if (
    issues.length > 0 ||
    email === undefined ||
    email === null ||
    password === undefined ||
    password === null
  ) {
    throw new ValidationError(issues);
  }

  return { email, password };
}

export function validateUpdateUserPayload(data: unknown): UserUpdatePayload {
  const issues: ValidationIssue[] = [];
  const payload = ensurePayload(data);

  const email = readField(payload, "email", "email", issues, { minLength: 1, email: true });
  const name = readField(payload, "name", "name", issues, { minLength: 2, maxLength: 120, nullable: true });
  const lastName = readField(payload, "lastName", "lastName", issues, {
    minLength: 2,
    maxLength: 120,
    nullable: true
  });
  const password = readField(payload, "password", "password", issues, { minLength: 8 });
  const addresses = validateAddresses(payload, issues);

  if (issues.length > 0) {
    throw new ValidationError(issues);
  }

  const result: UserUpdatePayload = {};

  if (typeof email === "string") {
    result.email = email;
  }

  if (typeof name === "string") {
    result.name = name;
  } else if (name === null) {
    result.name = null;
  }

  if (typeof lastName === "string") {
    result.lastName = lastName;
  } else if (lastName === null) {
    result.lastName = null;
  }

  // secondLastName
  if ("secondLastName" in payload) {
    const rawSecondLastName = payload.secondLastName;
    if (rawSecondLastName === null) {
      result.secondLastName = null;
    } else if (typeof rawSecondLastName === "string") {
      result.secondLastName = rawSecondLastName.trim() || null;
    }
  }

  if (typeof password === "string") {
    result.password = password;
  }

  // avatarUrl
  if ("avatarUrl" in payload) {
    const rawAvatar = payload.avatarUrl;
    if (rawAvatar === null) {
      result.avatarUrl = null;
    } else if (typeof rawAvatar === "string" && rawAvatar.trim().length > 0) {
      result.avatarUrl = rawAvatar.trim();
    }
  }

  // phone
  if ("phone" in payload) {
    const rawPhone = payload.phone;
    if (rawPhone === null) {
      result.phone = null;
    } else if (typeof rawPhone === "string") {
      const trimmedPhone = rawPhone.trim();
      if (trimmedPhone.length > 0 && !PHONE_REGEX.test(trimmedPhone)) {
        issues.push({ path: "phone", message: "Solo números, +, - y paréntesis." });
      } else {
        result.phone = trimmedPhone || null;
      }
    }
  }

  if (Array.isArray(addresses)) {
    result.addresses = addresses;
  }

  // Re-check issues after phone validation
  if (issues.length > 0) {
    throw new ValidationError(issues);
  }

  return result;
}
