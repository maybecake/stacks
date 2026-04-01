## ADDED Requirements

### Requirement: Python service dependencies are pinned to exact versions
`service/requirements.txt` SHALL specify exact versions for all dependencies using `==` pinning. Unpinned or range-pinned entries are not permitted.

#### Scenario: Requirements file contains pinned versions
- **WHEN** `service/requirements.txt` is read
- **THEN** every listed package has an `==<version>` constraint (e.g. `grpcio==1.71.0`)

#### Scenario: Install is reproducible across environments
- **WHEN** `pip install -r service/requirements.txt` is run in a clean environment
- **THEN** the exact same package versions are installed regardless of when the command is run

### Requirement: Pinned versions are the latest stable release at time of pinning
When pinning Python dependencies, the version chosen SHALL be the latest stable release available on PyPI at the time the pin is set.

#### Scenario: Version selected from PyPI stable releases
- **WHEN** choosing the pin value for a package
- **THEN** the version matches the latest non-pre-release version on PyPI (e.g. not `rc`, `alpha`, `beta` suffixes)
